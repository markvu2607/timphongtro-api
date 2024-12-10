import { IsNotEmpty, IsUUID } from 'class-validator';

import { IsString } from 'class-validator';

export class CreateNewsRequestDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  shortDescription: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsUUID()
  @IsNotEmpty()
  provinceId: string;
}
