import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { HashingService } from '../auth/hashing/hashing.service';
import { BcryptService } from '../auth/hashing/bcrypt.service';

@Module({
  imports: [RepositoriesModule],
  providers: [
    UsersService,
    {
      provide: HashingService,
      useClass: BcryptService,
    },
  ],
  controllers: [UsersController],
})
export class UsersModule {}
