import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import { PaginationRequestDto } from 'src/common/dtos/requests/pagination.request.dto';
import { EPostStatus } from 'src/common/enums/post-status.enum';
import { ERole } from 'src/common/enums/role.enum';
import { S3Service } from 'src/lib/s3/s3.service';
import {
  District,
  Post,
  PostImage,
  Province,
  User,
} from 'src/repositories/entities';
import { CreatePostRequestDto } from './dtos/requests/create-post.request.dto';
import { UpdatePostRequestDto } from './dtos/requests/update-post.request.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    @InjectRepository(PostImage)
    private readonly postImagesRepository: Repository<PostImage>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(District)
    private readonly districtsRepository: Repository<District>,
    @InjectRepository(Province)
    private readonly provincesRepository: Repository<Province>,
    private readonly s3Service: S3Service,
    private readonly configService: ConfigService,
  ) {}

  async getPosts(
    query: PaginationRequestDto,
  ): Promise<{ posts: Post[]; total: number; page: number; limit: number }> {
    const { page, limit, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.postsRepository.createQueryBuilder('post');

    queryBuilder.where('post.deletedAt IS NULL');

    if (search) {
      queryBuilder.where('post.title LIKE :search', { search: `%${search}%` });
    }

    queryBuilder
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.district', 'district')
      .leftJoinAndSelect('post.province', 'province')
      .leftJoinAndSelect(
        'post.postImages',
        'postImages',
        'postImages.deletedAt IS NOT NULL',
      )
      .orderBy(`post.${sortBy}`, sortOrder)
      .skip(skip)
      .take(limit);

    const [posts, total] = await queryBuilder.getManyAndCount();

    return { posts, total, page, limit };
  }

  async getPostsByOwnerId(
    userId: string,
    query: PaginationRequestDto,
  ): Promise<{ posts: Post[]; total: number; page: number; limit: number }> {
    const user = await this.usersRepository.findOne({
      where: { id: userId, deletedAt: IsNull() },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user.isVerified) {
      throw new ForbiddenException('User is not verified');
    }

    const { page, limit, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.postsRepository.createQueryBuilder('post');

    queryBuilder
      .where('post.deletedAt IS NULL')
      .leftJoinAndSelect('post.user', 'user')
      .andWhere('post.user.id = :userId', { userId });

    if (search) {
      queryBuilder.andWhere('post.title LIKE :search', {
        search: `%${search}%`,
      });
    }

    queryBuilder
      .leftJoinAndSelect('post.district', 'district')
      .leftJoinAndSelect('post.province', 'province')
      .leftJoinAndSelect(
        'post.postImages',
        'postImages',
        'postImages.deletedAt IS NOT NULL',
      )
      .orderBy(`post.${sortBy}`, sortOrder)
      .skip(skip)
      .take(limit);

    const [posts, total] = await queryBuilder.getManyAndCount();

    return { posts, total, page, limit };
  }

  async getPostById(id: string): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['user', 'district', 'province', 'postImages'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async createPost(
    userId: string,
    createPostRequestDto: CreatePostRequestDto,
    postImages: Express.Multer.File[],
  ): Promise<Post> {
    const { districtId, provinceId, ...postData } = createPostRequestDto;

    if (!postImages || postImages.length === 0) {
      throw new BadRequestException('No images provided');
    }

    const user = await this.usersRepository.findOne({
      where: { id: userId, deletedAt: IsNull() },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const district = await this.districtsRepository.findOne({
      where: { id: districtId, deletedAt: IsNull() },
    });
    if (!district) {
      throw new NotFoundException('District not found');
    }

    const province = await this.provincesRepository.findOne({
      where: { id: provinceId, deletedAt: IsNull() },
    });
    if (!province) {
      throw new NotFoundException('Province not found');
    }

    const uploadedFiles = await Promise.all(
      postImages.map(async (image) => {
        const key = await this.s3Service.uploadFile(
          image.originalname,
          image.buffer,
        );
        const url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

        const postImage = this.postImagesRepository.create({
          url: url,
          key,
        });

        const savedPostImage = await this.postImagesRepository.save(postImage);
        return savedPostImage;
      }),
    );

    const post = this.postsRepository.create({
      ...postData,
      district,
      province,
      user,
      thumbnail: uploadedFiles[0].url,
      postImages: uploadedFiles,
    });
    return await this.postsRepository.save(post);
  }

  async updatePost(
    userId: string,
    id: string,
    updatePostRequestDto: UpdatePostRequestDto,
    newPostImages: Express.Multer.File[],
  ): Promise<Post> {
    const { districtId, provinceId, existingPostImages, ...postData } =
      updatePostRequestDto;

    const post = await this.getPostById(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.user.id !== userId) {
      throw new ForbiddenException('You are not allowed to update this post');
    }

    const district = await this.districtsRepository.findOne({
      where: { id: districtId, deletedAt: IsNull() },
    });
    if (!district) {
      throw new NotFoundException('District not found');
    }

    const province = await this.provincesRepository.findOne({
      where: { id: provinceId, deletedAt: IsNull() },
    });
    if (!province) {
      throw new NotFoundException('Province not found');
    }

    const postImages = await this.postImagesRepository.find({
      where: { post: { id: id } },
    });

    const shouldRemovePostImages = postImages.filter(
      (postImage) => !existingPostImages.includes(postImage.id),
    );

    await Promise.all(
      shouldRemovePostImages.map(async (image) => {
        await this.postImagesRepository.softDelete(image.id);
      }),
    );

    const uploadedFiles = await Promise.all(
      newPostImages.map(async (image) => {
        const key = await this.s3Service.uploadFile(
          image.originalname,
          image.buffer,
        );
        const url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

        const postImage = this.postImagesRepository.create({
          url: url,
          key,
          post: { id },
        });

        const savedPostImage = await this.postImagesRepository.save(postImage);
        return savedPostImage;
      }),
    );

    const updatedPost = {
      ...postData,
      district,
      province,
      status: EPostStatus.REVIEWING,
      postImages: [
        ...existingPostImages.map((imageId) => ({ id: imageId })),
        ...uploadedFiles,
      ],
    };

    try {
      return await this.postsRepository.save(updatedPost);
    } catch {
      throw new BadRequestException('Failed to update post');
    }
  }

  async deletePost(user: { sub: string; role: ERole }, id: string) {
    const post = await this.getPostById(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.user.id !== user.sub && user.role !== ERole.ADMIN) {
      throw new ForbiddenException('You are not allowed to delete this post');
    }

    try {
      const postImages = await this.postImagesRepository.find({
        where: { post: { id }, deletedAt: IsNull() },
      });
      await Promise.all(
        postImages.map(async (image) => {
          await this.postImagesRepository.softDelete(image.id);
        }),
      );
      await this.postsRepository.softDelete(id);
      return;
    } catch {
      throw new BadRequestException('Failed to delete post');
    }
  }

  async publishPost(userId: string, id: string) {
    const post = await this.getPostById(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.user.id !== userId) {
      throw new ForbiddenException('You are not allowed to publish this post');
    }

    if (post.status === EPostStatus.PUBLISHED) {
      throw new BadRequestException('Post is already published');
    }

    if (post.status !== EPostStatus.APPROVED) {
      throw new BadRequestException('Post status is not approved');
    }

    post.publishedAt = new Date();
    post.status = EPostStatus.PUBLISHED;
    return await this.postsRepository.save(post);
  }

  async closePost(userId: string, id: string) {
    const post = await this.getPostById(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.user.id !== userId) {
      throw new ForbiddenException('You are not allowed to close this post');
    }

    if (post.status === EPostStatus.CLOSED) {
      throw new BadRequestException('Post is already closed');
    }

    if (post.status !== EPostStatus.PUBLISHED) {
      throw new BadRequestException('Post is not published yet');
    }

    post.publishedAt = null;
    post.status = EPostStatus.CLOSED;
    return await this.postsRepository.save(post);
  }

  async approvePost(id: string) {
    const post = await this.getPostById(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.status === EPostStatus.APPROVED) {
      throw new BadRequestException('Post is already approved');
    }

    if (post.status !== EPostStatus.REVIEWING) {
      throw new BadRequestException('Post is not in reviewing status');
    }

    post.status = EPostStatus.APPROVED;
    return await this.postsRepository.save(post);
  }

  async rejectPost(id: string) {
    const post = await this.getPostById(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.status === EPostStatus.REJECTED) {
      throw new BadRequestException('Post is already rejected');
    }

    if (post.status !== EPostStatus.REVIEWING) {
      throw new BadRequestException('Post is not in reviewing status');
    }

    post.status = EPostStatus.REJECTED;
    return await this.postsRepository.save(post);
  }

  async getPostListByIds(ids: string[]): Promise<Post[]> {
    const postList = await Promise.allSettled(
      ids.map(async (id) => {
        return await this.getPostById(id);
      }),
    );

    const availablePosts = postList
      .filter(
        (result): result is PromiseFulfilledResult<Post> =>
          result.status === 'fulfilled' && result.value !== null,
      )
      .map((result) => result.value);

    return availablePosts;
  }
}
