import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IsEmail } from 'class-validator';

export class CreateUserRequestDto {
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(254)
  @Transform(({ value }) => value?.trim()?.toLowerCase())
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    {
      message:
        'Password must contain uppercase, lowercase, number and special character.',
    },
  )
  password: string;

  @IsString()
  name: string;

  @IsPhoneNumber('VN')
  phone: string;
}