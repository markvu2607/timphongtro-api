import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateReportRequestDto {
  @IsNotEmpty()
  @IsString()
  reason: string;

  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  postId: string;
}
