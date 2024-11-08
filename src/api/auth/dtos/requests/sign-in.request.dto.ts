import { IsEmail, IsNotEmpty, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class SignInRequestDto {
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim()?.toLowerCase())
  email: string;

  @IsNotEmpty()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    {
      message:
        'Password must contain uppercase, lowercase, number and special character.',
    },
  )
  password: string;
}
