import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  District,
  News,
  PaymentPackage,
  Post,
  PostImage,
  Province,
  Report,
  User,
} from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Province,
      District,
      User,
      Post,
      PostImage,
      News,
      Report,
      PaymentPackage,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class RepositoriesModule {}
