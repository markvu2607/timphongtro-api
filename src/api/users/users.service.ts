import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserResponseDto } from './dtos/responses/user.response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findOneById(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { id: id },
    });

    return new UserResponseDto(user);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersRepository.find();
    return users.map((user) => new UserResponseDto(user));
  }

  async create(user: Omit<User, 'id'>): Promise<UserResponseDto> {
    const createdUser = await this.usersRepository.save(user);
    return new UserResponseDto(createdUser);
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
