import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { S3Service } from 'src/lib/s3/s3.service';
import { IsNull, Like, Repository } from 'typeorm';

import { PgErrorCode } from 'src/common/constants';
import { PaginationRequestDto } from 'src/common/dtos/requests/pagination.request.dto';
import { ERole } from 'src/common/enums/role.enum';
import { User } from 'src/repositories/entities';
import { HashingService } from '../auth/hashing/hashing.service';
import { CreateUserRequestDto } from './dtos/requests/create-user.request.dto';
import { UpdateUserRequestDto } from './dtos/requests/update-user.request.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly hashingService: HashingService,
    private readonly s3Service: S3Service,
  ) {}

  async findOneById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: id, deletedAt: IsNull() },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findAll(query: PaginationRequestDto): Promise<{
    users: User[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page, limit, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.usersRepository.createQueryBuilder('user');

    queryBuilder.where('user.deletedAt IS NULL');

    if (search) {
      queryBuilder.where([
        { name: Like(`%${search}%`) },
        { email: Like(`%${search}%`) },
        { phone: Like(`%${search}%`) },
      ]);
    }

    queryBuilder.orderBy(`user.${sortBy}`, sortOrder).skip(skip).take(limit);

    const [users, total] = await queryBuilder.getManyAndCount();

    return { users, total, page, limit };
  }

  async createAdminUser(
    createUserRequestDto: CreateUserRequestDto,
  ): Promise<User> {
    try {
      const hashedPassword = await this.hashingService.hash(
        createUserRequestDto.password,
      );

      const user = this.usersRepository.create({
        email: createUserRequestDto.email,
        password: hashedPassword,
        name: createUserRequestDto.name,
        phone: createUserRequestDto.phone,
        isVerified: true,
        role: ERole.ADMIN,
      });

      return await this.usersRepository.save(user);
    } catch (error) {
      if (error.code === PgErrorCode.UNIQUE_VIOLATION) {
        throw new ConflictException();
      }
      throw error;
    }
  }

  async update(
    id: string,
    updateUserRequestDto: UpdateUserRequestDto,
  ): Promise<User> {
    const userToUpdate = await this.findOneById(id);
    if (!userToUpdate) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.usersRepository.save({
      ...userToUpdate,
      ...updateUserRequestDto,
    });

    return updatedUser;
  }

  async delete(id: string): Promise<void> {
    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      await this.usersRepository.softDelete(id);
      return;
    } catch {
      throw new BadRequestException('Failed to delete user');
    }
  }

  async changeAvatar(
    userId: string,
    avatar: Express.Multer.File,
  ): Promise<Record<string, never>> {
    const user = await this.findOneById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!avatar) {
      throw new BadRequestException('Avatar is required');
    }

    const key = await this.s3Service.uploadFile(
      avatar.originalname,
      avatar.buffer,
    );
    const url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    user.avatar = url;
    await this.usersRepository.save(user);
    return {};
  }
}
