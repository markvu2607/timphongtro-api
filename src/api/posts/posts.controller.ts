import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

import { MAX_FILE_SIZE } from 'src/common/constants';
import { PaginationRequestDto } from 'src/common/dtos/requests/pagination.request.dto';
import { ERole } from 'src/common/enums/role.enum';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { User } from '../users/decorators/user.decorator';
import { CreatePostRequestDto } from './dtos/requests/create-post.request.dto';
import { UpdatePostRequestDto } from './dtos/requests/update-post.request.dto';
import { PaginatedPostsResponseDto } from './dtos/responses/get-posts.response.dto';
import { PostResponseDto } from './dtos/responses/post.response.dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Public()
  @Get('published')
  @HttpCode(HttpStatus.OK)
  async getPublishedPosts(@Query() query: PaginationRequestDto) {
    const { posts, total, page, limit } =
      await this.postsService.getPublishedPosts(query);

    return new PaginatedPostsResponseDto({
      items: posts.map((post) => new PostResponseDto(post)),
      total,
      page,
      limit,
    });
  }

  @Public()
  @Get('published/list')
  @HttpCode(HttpStatus.OK)
  async getPublishedPostListByIds(
    @Query('ids', { transform: (value) => value.split(',') }) ids: string[],
  ) {
    const postList = await this.postsService.getPublishedPostListByIds(ids);
    return postList.map((post) => new PostResponseDto(post));
  }

  @Public()
  @Get('published/:id')
  @HttpCode(HttpStatus.OK)
  async getPublishedPostById(@Param('id') id: string) {
    const post = await this.postsService.getPublishedPostById(id);
    return new PostResponseDto(post);
  }

  @Roles(ERole.USER)
  @Get('mine')
  @HttpCode(HttpStatus.OK)
  async getPostsByOwnerId(
    @User('sub') ownerId: string,
    @Query() query: PaginationRequestDto,
  ) {
    const { posts, total, page, limit } =
      await this.postsService.getPostsByOwnerId(ownerId, query);

    return new PaginatedPostsResponseDto({
      items: posts.map((post) => new PostResponseDto(post)),
      total,
      page,
      limit,
    });
  }

  @Roles(ERole.USER)
  @Get('mine/:id')
  @HttpCode(HttpStatus.OK)
  async getPostByIdAndOwnerId(
    @User('sub') ownerId: string,
    @Param('id') id: string,
  ) {
    const post = await this.postsService.getPostByIdAndOwnerId(ownerId, id);
    return new PostResponseDto(post);
  }

  @Roles(ERole.USER)
  @Post('mine')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FilesInterceptor('postImages', 10, {
      limits: {
        fileSize: MAX_FILE_SIZE,
      },
    }),
  )
  async createPost(
    @User('sub') userId: string,
    @Body() createPostRequestDto: CreatePostRequestDto,
    @UploadedFiles() postImages: Express.Multer.File[],
  ) {
    const post = await this.postsService.createPost(
      userId,
      createPostRequestDto,
      postImages,
    );

    return new PostResponseDto(post);
  }

  @Roles(ERole.USER)
  @Patch('mine/:id')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FilesInterceptor('postImages', 10, {
      limits: {
        fileSize: MAX_FILE_SIZE,
      },
    }),
  )
  async updatePost(
    @User('sub') userId: string,
    @Param('id') id: string,
    @Body() updatePostRequestDto: UpdatePostRequestDto,
    @UploadedFiles() postImages: Express.Multer.File[],
  ): Promise<PostResponseDto> {
    const post = await this.postsService.updatePost(
      userId,
      id,
      updatePostRequestDto,
      postImages,
    );

    return new PostResponseDto(post);
  }

  @Roles(ERole.USER)
  @Delete('mine/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePostByOwnerId(
    @User('sub') ownerId: string,
    @Param('id') id: string,
  ) {
    return await this.postsService.deletePostByOwnerId(ownerId, id);
  }

  @Roles(ERole.USER)
  @Post('mine/:id/publish')
  @HttpCode(HttpStatus.OK)
  async publishPost(@User('sub') userId: string, @Param('id') id: string) {
    return await this.postsService.publishPost(userId, id);
  }

  @Roles(ERole.USER)
  @Post('mine/:id/close')
  @HttpCode(HttpStatus.OK)
  async closePost(@User('sub') userId: string, @Param('id') id: string) {
    return await this.postsService.closePost(userId, id);
  }

  @Roles(ERole.ADMIN)
  @Get()
  @HttpCode(HttpStatus.OK)
  async getPosts(@Query() query: PaginationRequestDto) {
    const { posts, total, page, limit } =
      await this.postsService.getPosts(query);

    return new PaginatedPostsResponseDto({
      items: posts.map((post) => new PostResponseDto(post)),
      total,
      page,
      limit,
    });
  }

  @Roles(ERole.ADMIN)
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getPostById(@Param('id') id: string) {
    const post = await this.postsService.getPostById(id);
    return new PostResponseDto(post);
  }

  @Roles(ERole.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deletePost(@Param('id') id: string) {
    return await this.postsService.deletePost(id);
  }

  @Roles(ERole.ADMIN)
  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  async approvePost(@Param('id') id: string) {
    return await this.postsService.approvePost(id);
  }

  @Roles(ERole.ADMIN)
  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  async rejectPost(@Param('id') id: string) {
    return await this.postsService.rejectPost(id);
  }
}
