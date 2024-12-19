import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { SignUpRequestDto } from './dtos/requests/sign-up.request.dto';
import { SignInRequestDto } from './dtos/requests/sign-in.request.dto';
import { SignUpResponseDto } from './dtos/responses/sign-up.response.dto';
import { SignInResponseDto } from './dtos/responses/sign-in.response.dto';
import { VerifyEmailRequestDto } from './dtos/requests/verify-email.request.dto';
import { UserResponseDto } from '../users/dtos/responses/user.response.dto';
import { Roles } from './decorators/roles.decorator';
import { ERole } from 'src/common/enums/role.enum';
import { User } from '../users/decorators/user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() body: SignUpRequestDto): Promise<SignUpResponseDto> {
    const { user, accessToken } = await this.authService.signUp(body);

    return new SignUpResponseDto({
      user: new UserResponseDto(user),
      accessToken,
    });
  }

  @Public()
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() body: SignInRequestDto): Promise<SignInResponseDto> {
    const { user, accessToken } = await this.authService.signIn(body);

    return new SignInResponseDto({
      user: new UserResponseDto(user),
      accessToken,
    });
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() body: VerifyEmailRequestDto) {
    await this.authService.verifyEmail(body);
    return {};
  }

  @Roles(ERole.USER)
  @Post('send-verification-email')
  @HttpCode(HttpStatus.OK)
  async sendVerificationEmail(@User('sub') userId: string) {
    await this.authService.sendVerificationEmail(userId);
    return {};
  }
}
