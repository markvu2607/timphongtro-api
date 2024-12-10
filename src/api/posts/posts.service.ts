import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationRequestDto } from 'src/common/dtos/requests/pagination.request.dto';
import { S3Service } from 'src/lib/s3/s3.service';
import {
  District,
  Post,
  PostImage,
  Province,
  User,
} from 'src/repositories/entities';
import { IsNull, Repository } from 'typeorm';
import { CreatePostRequestDto } from './dtos/requests/create-post.request.dto';

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
  ) {}

  async createPost(
    userId: string,
    createPostRequestDto: CreatePostRequestDto,
    postImages: Express.Multer.File[],
  ): Promise<any> {
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
        await this.s3Service.uploadFile(image.originalname, image.buffer);
        const url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${image.originalname}`;

        const postImage = this.postImagesRepository.create({
          url: url,
        });

        const savedPostImage = await this.postImagesRepository.save(postImage);
        console.log(savedPostImage);
        return savedPostImage;
      }),
    );

    const post = this.postsRepository.create({
      ...postData,
      district,
      province,
      user,
      postImages: uploadedFiles,
    });
    return await this.postsRepository.save(post);
  }

  async getPostById(id: string): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['postImages', 'user', 'district', 'province'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async getPosts(
    query: PaginationRequestDto,
  ): Promise<{ posts: Post[]; total: number; page: number; limit: number }> {
    const { page, limit, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.postsRepository.createQueryBuilder('post');

    if (search) {
      queryBuilder.where('post.title LIKE :search', { search: `%${search}%` });
    }

    queryBuilder
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.district', 'district')
      .leftJoinAndSelect('post.province', 'province')
      .orderBy(`post.${sortBy}`, sortOrder)
      .skip(skip)
      .take(limit);

    const [posts, total] = await queryBuilder.getManyAndCount();

    return { posts, total, page, limit };
  }
}
