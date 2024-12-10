import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationRequestDto } from 'src/common/dtos/requests/pagination.request.dto';
import { Like, Repository } from 'typeorm';
import { UserResponseDto } from './dtos/responses/user.response.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findOneById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: id },
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

  async create(user: Omit<User, 'id'>): Promise<User> {
    const createdUser = await this.usersRepository.save(user);

    return createdUser;
  }

  async update(
    id: string,
    user: Partial<Omit<User, 'id'>>,
  ): Promise<UserResponseDto> {
    await this.usersRepository.update(id, user);
    const updatedUser = await this.usersRepository.findOne({ where: { id } });
    return new UserResponseDto(updatedUser);
  }

  async delete(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
