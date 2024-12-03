import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { User } from '../users/decorators/user.decorator';
import { CreatePostRequestDto } from './dtos/requests/create-post.request.dto';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('postImages', 10))
  @HttpCode(HttpStatus.CREATED)
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
}
