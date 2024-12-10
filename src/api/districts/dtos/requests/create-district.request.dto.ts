import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateDistrictRequestDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsUUID()
  provinceId: string;
}
