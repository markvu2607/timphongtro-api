import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePaymentPackageRequestDto {
  @IsString()
  @IsNotEmpty()
  stripeProductId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsString()
  @IsNotEmpty()
  currency: string;
}
