import { MailerService } from '@nestjs-modules/mailer';
import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { PgErrorCode } from 'src/common/constants/pg-error-code.constant';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { SignInRequestDto } from './dtos/requests/sign-in.request.dto';
import { SignUpRequestDto } from './dtos/requests/sign-up.request.dto';
import { SignInResponseDto } from './dtos/responses/sign-in.response.dto';
import { SignUpResponseDto } from './dtos/responses/sign-up.response.dto';
import { UserWithEmailResponseDto } from './dtos/responses/user-with-email.response.dto';
import { Account } from './entities/account.entity';
import { Role } from './entities/role.entity';
import { ERole } from './enums/role.enum';
import { HashingService } from './hashing/hashing.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Account)
    private readonly accountsRepository: Repository<Account>,
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
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

      const role = await this.rolesRepository.findOneBy({ name: ERole.USER });
      if (!role) {
        throw new NotFoundException('Default user role not found.');
      }
      const account = this.accountsRepository.create({
        email: signUpRequestDto.email,
        password: hashedPassword,
        role,
      });
      const user = this.usersRepository.create({
        firstName: signUpRequestDto.firstName,
        lastName: signUpRequestDto.lastName,
        phone: signUpRequestDto.phone,
        bio: signUpRequestDto.bio,
        isVerified: false,
        account,
      });

      const savedAccount = await this.usersRepository.manager.transaction(
        async (manager) => {
          await manager.save(user);
          account.user = user;
          const savedAccount = await manager.save(account);
          return savedAccount;
        },
      );

      const accessToken = await this.generateJwtToken({
        id: account.user.id,
        role: account.role.id,
      });

      this.mailerService.sendMail({
        to: savedAccount.email,
        subject: 'Verify Email',
        template: 'verify-email',
        context: {
          webUrl: 'http://localhost:3000/verify-email',
          token: '123456',
        },
      });

      return new SignUpResponseDto({
        user: new UserWithEmailResponseDto(savedAccount),
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
    const account = await this.accountsRepository.findOne({
      where: { email: signInRequestDto.email },
      relations: ['user', 'role'],
    });

    if (!account) {
      throw new NotFoundException('Invalid email or password.');
    }

    const isValidPassword = await this.hashingService.compare(
      signInRequestDto.password,
      account.password,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const accessToken = await this.generateJwtToken({
      id: account.user.id,
      role: account.role.id,
    });

    return new SignInResponseDto({
      user: new UserWithEmailResponseDto(account),
      accessToken: accessToken,
    });
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
