import { IsNotEmpty } from 'class-validator';

export class CreatePostRequestDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  address: string;

  @IsNotEmpty()
  longitude: number;

  @IsNotEmpty()
  latitude: number;

  @IsNotEmpty()
  districtId: string;

  @IsNotEmpty()
  provinceId: string;

  @IsNotEmpty()
  price: number;

  @IsNotEmpty()
  area: number;
}
