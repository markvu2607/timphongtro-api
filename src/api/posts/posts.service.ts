import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Stripe from 'stripe';
import { Repository } from 'typeorm';

import { PaginationRequestDto } from 'src/common/dtos/requests/pagination.request.dto';
import { EPostStatus } from 'src/common/enums/post-status.enum';
import { S3Service } from 'src/lib/s3/s3.service';
import {
  District,
  PaymentPackage,
  Post,
  PostImage,
  Province,
  User,
} from 'src/repositories/entities';
import { CreatePostRequestDto } from './dtos/requests/create-post.request.dto';
import { GetPostsQueryParamsRequestDto } from './dtos/requests/get-posts-query-params.request.dto';
import { UpdatePostRequestDto } from './dtos/requests/update-post.request.dto';
import { StripeService } from 'src/lib/stripe/stripe.service';

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
    @InjectRepository(PaymentPackage)
    private readonly paymentPackageRepository: Repository<PaymentPackage>,
    private readonly s3Service: S3Service,
    private readonly stripeService: StripeService,
  ) {}

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
      .leftJoinAndSelect('post.paymentPackage', 'paymentPackage')
      .leftJoinAndSelect('post.postImages', 'postImages')
      .orderBy(`post.${sortBy}`, sortOrder)
      .skip(skip)
      .take(limit);

    const [posts, total] = await queryBuilder.getManyAndCount();

    return { posts, total, page, limit };
  }

  async getPublishedPosts(
    query: GetPostsQueryParamsRequestDto,
  ): Promise<{ posts: Post[]; total: number; page: number; limit: number }> {
    const {
      page,
      limit,
      search,
      sortBy,
      sortOrder,
      provinceId,
      districtId,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
    } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.postsRepository.createQueryBuilder('post');

    queryBuilder.where('post.status = :status', {
      status: EPostStatus.PUBLISHED,
    });

    if (search) {
      queryBuilder.andWhere('post.title LIKE :search', {
        search: `%${search}%`,
      });
    }

    if (minPrice) {
      queryBuilder.andWhere('post.price >= :minPrice', { minPrice });
    }

    if (maxPrice) {
      queryBuilder.andWhere('post.price <= :maxPrice', { maxPrice });
    }

    if (minArea) {
      queryBuilder.andWhere('post.area >= :minArea', { minArea });
    }

    if (maxArea) {
      queryBuilder.andWhere('post.area <= :maxArea', { maxArea });
    }

    queryBuilder
      .leftJoinAndSelect('post.district', 'district')
      .leftJoinAndSelect('post.province', 'province');

    if (provinceId) {
      queryBuilder.andWhere('post.province.id = :provinceId', { provinceId });
    }

    if (districtId) {
      queryBuilder.andWhere('post.district.id = :districtId', { districtId });
    }

    queryBuilder
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.paymentPackage', 'paymentPackage')
      .leftJoinAndSelect('post.postImages', 'postImages')
      .orderBy(`post.${sortBy}`, sortOrder)
      .skip(skip)
      .take(limit);

    const [posts, total] = await queryBuilder.getManyAndCount();

    return { posts, total, page, limit };
  }

  async getPostsByOwnerId(
    ownerId: string,
    query: PaginationRequestDto,
  ): Promise<{ posts: Post[]; total: number; page: number; limit: number }> {
    const user = await this.usersRepository.findOne({
      where: { id: ownerId },
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
      .leftJoinAndSelect('post.user', 'user')
      .andWhere('post.user.id = :ownerId', { ownerId });

    if (search) {
      queryBuilder.andWhere('post.title LIKE :search', {
        search: `%${search}%`,
      });
    }

    queryBuilder
      .leftJoinAndSelect('post.district', 'district')
      .leftJoinAndSelect('post.province', 'province')
      .leftJoinAndSelect('post.paymentPackage', 'paymentPackage')
      .leftJoinAndSelect('post.postImages', 'postImages')
      .orderBy(`post.${sortBy}`, sortOrder)
      .skip(skip)
      .take(limit);

    const [posts, total] = await queryBuilder.getManyAndCount();

    return { posts, total, page, limit };
  }

  async deletePost(id: string) {
    const post = await this.getPostById(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    try {
      const postImages = await this.postImagesRepository.find({
        where: { post: { id } },
      });
      await Promise.all(
        postImages.map(async (image) => {
          this.s3Service.deleteFile(image.key);
        }),
      );
      await Promise.all(
        postImages.map(async (image) => {
          await this.postImagesRepository.delete(image.id);
        }),
      );
      await this.postsRepository.delete(id);
      return;
    } catch {
      throw new BadRequestException('Failed to delete post');
    }
  }

  async getPostById(id: string): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: [
        'user',
        'district',
        'province',
        'paymentPackage',
        'postImages',
      ],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async getPostByIdAndOwnerId(ownerId: string, id: string): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: [
        'user',
        'district',
        'province',
        'paymentPackage',
        'postImages',
      ],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.user.id !== ownerId) {
      throw new ForbiddenException('You are not allowed to view this post');
    }

    return post;
  }

  async getPublishedPostById(id: string): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: [
        'user',
        'district',
        'province',
        'paymentPackage',
        'postImages',
      ],
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    if (post.status !== EPostStatus.PUBLISHED) {
      throw new BadRequestException('Post not found');
    }
    return post;
  }

  async createPost(
    userId: string,
    createPostRequestDto: CreatePostRequestDto,
    postImages: Express.Multer.File[],
  ): Promise<Post> {
    const { districtId, provinceId, paymentPackageId, ...postData } =
      createPostRequestDto;

    if (!postImages || postImages.length === 0) {
      throw new BadRequestException('No images provided');
    }

    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const district = await this.districtsRepository.findOne({
      where: { id: districtId },
    });
    if (!district) {
      throw new NotFoundException('District not found');
    }

    const province = await this.provincesRepository.findOne({
      where: { id: provinceId },
    });
    if (!province) {
      throw new NotFoundException('Province not found');
    }

    const paymentPackage = await this.paymentPackageRepository.findOne({
      where: { id: paymentPackageId },
    });
    if (!paymentPackage) {
      throw new NotFoundException('Payment package not found');
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
      paymentPackage,
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
    const {
      districtId,
      provinceId,
      paymentPackageId,
      existingPostImages,
      ...postData
    } = updatePostRequestDto;

    const post = await this.getPostById(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.user.id !== userId) {
      throw new ForbiddenException('You are not allowed to update this post');
    }

    const district = await this.districtsRepository.findOne({
      where: { id: districtId },
    });
    if (!district) {
      throw new NotFoundException('District not found');
    }

    const province = await this.provincesRepository.findOne({
      where: { id: provinceId },
    });
    if (!province) {
      throw new NotFoundException('Province not found');
    }

    const paymentPackage = await this.paymentPackageRepository.findOne({
      where: { id: paymentPackageId },
    });
    if (!paymentPackage) {
      throw new NotFoundException('Payment package not found');
    }

    const postImages = await this.postImagesRepository.find({
      where: { post: { id: id } },
    });

    const shouldRemovePostImages = postImages.filter(
      (postImage) => !existingPostImages.includes(postImage.id),
    );

    await Promise.all(
      shouldRemovePostImages.map(async (image) => {
        await this.s3Service.deleteFile(image.key);
      }),
    );
    await Promise.all(
      shouldRemovePostImages.map(async (image) => {
        await this.postImagesRepository.delete(image.id);
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
      ...post,
      ...postData,
      district,
      province,
      paymentPackage,
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

  async deletePostByOwnerId(ownerId: string, id: string) {
    const post = await this.getPostById(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.user.id !== ownerId) {
      throw new ForbiddenException('You are not allowed to delete this post');
    }

    try {
      const postImages = await this.postImagesRepository.find({
        where: { post: { id } },
      });
      await Promise.all(
        postImages.map(async (image) => {
          this.s3Service.deleteFile(image.key);
        }),
      );
      await Promise.all(
        postImages.map(async (image) => {
          await this.postImagesRepository.delete(image.id);
        }),
      );
      await this.postsRepository.delete(id);
      return;
    } catch {
      throw new BadRequestException('Failed to delete post');
    }
  }

  async publishPost(
    userId: string,
    id: string,
  ): Promise<Post | Stripe.Checkout.Session> {
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

    if (post.paymentPackage.price === 0) {
      post.publishedAt = new Date();
      post.status = EPostStatus.PUBLISHED;
      return await this.postsRepository.save(post);
    } else {
      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
        {
          price_data: {
            currency: post.paymentPackage.currency,
            product_data: {
              name: post.paymentPackage.name,
            },
            unit_amount: post.paymentPackage.price,
          },
          quantity: 1,
        },
      ];
      return await this.stripeService.createCheckoutSession(lineItems, {
        postId: post.id,
      });
    }
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

  async getPublishedPostListByIds(ids: string[]): Promise<Post[]> {
    const postList = await Promise.allSettled(
      ids.map(async (id) => {
        return await this.getPublishedPostById(id);
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

  async forcePublishPost(id: string) {
    const post = await this.getPostById(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.status === EPostStatus.PUBLISHED) {
      throw new BadRequestException('Post is already published');
    }

    post.publishedAt = new Date();
    post.status = EPostStatus.PUBLISHED;
    return await this.postsRepository.save(post);
  }

  async getPublishedPremiumPosts(): Promise<Post[]> {
    const queryBuilder = this.postsRepository.createQueryBuilder('post');
    queryBuilder
      .where('post.status = :status', { status: EPostStatus.PUBLISHED })
      .leftJoinAndSelect('post.paymentPackage', 'paymentPackage')
      .where('paymentPackage.price > 0')
      .leftJoinAndSelect('post.postImages', 'postImages');

    return await queryBuilder.getMany();
  }
}
