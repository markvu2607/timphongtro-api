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

  async findOneById(id: number): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { id: id },
    });

    return new UserResponseDto(user);
  }
}
