import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserWithEmailResponseDto } from './dtos/responses/user-with-email.response.dto';
import { Account } from '../auth/entities/account.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Account)
    private readonly accountsRepository: Repository<Account>,
  ) {}

  async findOneById(id: number): Promise<UserWithEmailResponseDto> {
    const account = await this.accountsRepository.findOne({
      where: { user: { id: id } },
      relations: ['user', 'role'],
    });

    return new UserWithEmailResponseDto(account);
  }
}
