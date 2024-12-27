import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreatePostCheckoutSessionRequestDto {
  @IsNotEmpty()
  @IsUUID()
  postId: string;
}
