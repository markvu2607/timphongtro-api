import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty } from 'class-validator';

import { CreatePostRequestDto } from './create-post.request.dto';

export class UpdatePostRequestDto extends PartialType(CreatePostRequestDto) {
  @IsNotEmpty()
  existingPostImages: string[];
}
