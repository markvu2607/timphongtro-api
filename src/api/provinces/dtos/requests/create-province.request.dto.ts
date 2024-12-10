import { IsNotEmpty, IsString } from 'class-validator';

export class CreateProvinceRequestDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
