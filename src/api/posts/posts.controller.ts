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
import { PaginationRequestDto } from 'src/common/dtos/requests/pagination.request.dto';
import { ERole } from 'src/common/enums/role.enum';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { User } from '../users/decorators/user.decorator';
import { CreatePostRequestDto } from './dtos/requests/create-post.request.dto';
import { PaginatedPostsResponseDto } from './dtos/responses/get-posts.response.dto';
import { PostResponseDto } from './dtos/responses/post.response.dto';
import { PostsService } from './posts.service';
import { UpdatePostRequestDto } from './dtos/requests/update-post.request.dto';

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
    const post = await this.postsService.createPost(
      userId,
      createPostRequestDto,
      postImages,
    );

    return new PostResponseDto(post);
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

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FilesInterceptor('postImages', 10))
  async updatePost(
    @User() user: { sub: string; role: ERole },
    @Param('id') id: string,
    @Body() updatePostRequestDto: UpdatePostRequestDto,
    @UploadedFiles() postImages: Express.Multer.File[],
  ): Promise<PostResponseDto> {
    const post = await this.postsService.updatePost(
      user,
      id,
      updatePostRequestDto,
      postImages,
    );

    return new PostResponseDto(post);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(
    @User() user: { sub: string; role: ERole },
    @Param('id') id: string,
  ) {
    return await this.postsService.deletePost(user, id);
  }
}
