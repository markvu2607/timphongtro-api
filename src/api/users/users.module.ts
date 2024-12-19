import { Module } from '@nestjs/common';

import { S3Module } from 'src/lib/s3/s3.module';
import { RepositoriesModule } from 'src/repositories/repositories.module';
import { BcryptService } from '../auth/hashing/bcrypt.service';
import { HashingService } from '../auth/hashing/hashing.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [RepositoriesModule, S3Module],
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
