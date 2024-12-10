import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Roles } from '../auth/decorators/roles.decorator';
import { ERole } from '../auth/enums/role.enum';
import { User } from '../users/decorators/user.decorator';
import { CreatePostRequestDto } from './dtos/requests/create-post.request.dto';
import { PostsService } from './posts.service';
import { Public } from '../auth/decorators/public.decorator';
import { PaginationRequestDto } from 'src/common/dtos/requests/pagination.request.dto';
import { PostResponseDto } from './dtos/responses/post.response.dto';
import { PaginatedPostsResponseDto } from './dtos/responses/get-posts.response.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Roles(ERole.USER)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor('postImages', 10))
  async createPost(
    @User('sub') userId: string,
    @Body() createPostRequestDto: CreatePostRequestDto,
    @UploadedFiles() postImages: Express.Multer.File[],
  ) {
    return this.postsService.createPost(
      userId,
      createPostRequestDto,
      postImages,
    );
  }

  @Public()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getPostById(@Param('id') id: string) {
    const post = await this.postsService.getPostById(id);
    return new PostResponseDto(post);
  }

  @Public()
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
}
