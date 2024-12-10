import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationRequestDto } from 'src/common/dtos/requests/pagination.request.dto';
import { ERole } from 'src/common/enums/role.enum';
import { User } from 'src/repositories/entities';
import { IsNull, Like, Repository } from 'typeorm';
import { HashingService } from '../auth/hashing/hashing.service';
import { CreateUserRequestDto } from './dtos/requests/create-user.request.dto';
import { UpdateUserRequestDto } from './dtos/requests/update-user.request.dto';
import { PgErrorCode } from 'src/common/constants/pg-error-code.constant';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly hashingService: HashingService,
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
    } catch (error) {
      throw new BadRequestException('Failed to delete user');
    }
  }
}
