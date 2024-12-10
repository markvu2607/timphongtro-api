import { PartialType } from '@nestjs/mapped-types';
import { CreatePostRequestDto } from './create-post.request.dto';

export class UpdatePostRequestDto extends PartialType(CreatePostRequestDto) {}
