import { MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import ms from 'ms';
import { PgErrorCode } from 'src/common/constants/pg-error-code.constant';
import { Repository } from 'typeorm';
import { generateVerificationLink } from '../../common/utils';
import { UserResponseDto } from '../users/dtos/responses/user.response.dto';
import { User } from '../users/entities/user.entity';
import { SignInRequestDto } from './dtos/requests/sign-in.request.dto';
import { SignUpRequestDto } from './dtos/requests/sign-up.request.dto';
import { VerifyEmailRequestDto } from './dtos/requests/verify-email.request.dto';
import { SignInResponseDto } from './dtos/responses/sign-in.response.dto';
import { SignUpResponseDto } from './dtos/responses/sign-up.response.dto';
import { HashingService } from './hashing/hashing.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
  ) {}

  async signUp(signUpRequestDto: SignUpRequestDto): Promise<SignUpResponseDto> {
    try {
      const hashedPassword = await this.hashingService.hash(
        signUpRequestDto.password,
      );

      const verificationToken = await this.hashingService.hash(
        signUpRequestDto.email,
      );

      const user = this.usersRepository.create({
        email: signUpRequestDto.email,
        password: hashedPassword,
        name: signUpRequestDto.name,
        phone: signUpRequestDto.phone,
        isVerified: false,
        verificationToken,
        tokenExpiration: new Date(
          Date.now() +
            ms(this.configService.get<string>('app.verificationTokenTTL')),
        ),
      });

      const savedUser = await this.usersRepository.save(user);

      const accessToken = await this.generateJwtToken({
        id: savedUser.id,
        role: savedUser.role,
      });

      this.mailerService.sendMail({
        to: savedUser.email,
        subject: 'Verify Email',
        template: 'verify-email',
        context: {
          verification_link: generateVerificationLink(
            this.configService.get<string>('web.url'),
            verificationToken,
          ),
        },
      });

      return new SignUpResponseDto({
        user: new UserResponseDto(savedUser),
        accessToken,
      });
    } catch (error) {
      if (error.code === PgErrorCode.UNIQUE_VIOLATION) {
        throw new ConflictException();
      }
      throw error;
    }
  }

  async signIn(signInRequestDto: SignInRequestDto): Promise<SignInResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { email: signInRequestDto.email },
    });

    if (!user) {
      throw new NotFoundException('Invalid email or password.');
    }

    const isValidPassword = await this.hashingService.compare(
      signInRequestDto.password,
      user.password,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const accessToken = await this.generateJwtToken({
      id: user.id,
      role: user.role,
    });

    return new SignInResponseDto({
      user: new UserResponseDto(user),
      accessToken: accessToken,
    });
  }

  async verifyEmail({ token }: VerifyEmailRequestDto) {
    const user = await this.usersRepository.findOneBy({
      verificationToken: token,
    });
    if (!user) {
      throw new BadRequestException('Token invalid.');
    }

    const updatedUser = this.usersRepository.merge(user, {
      isVerified: true,
      verificationToken: null,
      tokenExpiration: null,
    });

    await this.usersRepository.save(updatedUser);
  }

  async generateJwtToken(
    user: { id: User['id'] } & Record<string, any>,
  ): Promise<string> {
    const { id, ...others } = user;
    const payload = {
      sub: id,
      ...others,
    };

    return this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get('jwt.accessTokenTtl'),
      secret: this.configService.get('jwt.secret'),
    });
  }
}
