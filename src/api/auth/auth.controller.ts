import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { SignUpRequestDto } from './dtos/requests/sign-up.request.dto';
import { SignInRequestDto } from './dtos/requests/sign-in.request.dto';
import { SignUpResponseDto } from './dtos/responses/sign-up.response.dto';
import { SignInResponseDto } from './dtos/responses/sign-in.response.dto';
import { VerifyEmailRequestDto } from './dtos/requests/verify-email.request.dto';
import { VerifyEmailResponseDto } from './dtos/responses/verify-email.response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  signUp(@Body() body: SignUpRequestDto): Promise<SignUpResponseDto> {
    return this.authService.signUp(body);
  }

  @Public()
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  signIn(@Body() body: SignInRequestDto): Promise<SignInResponseDto> {
    return this.authService.signIn(body);
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  verifyEmail(
    @Body() body: VerifyEmailRequestDto,
  ): Promise<VerifyEmailResponseDto> {
    return this.authService.verifyEmail(body);
  }
}
