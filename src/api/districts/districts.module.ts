import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DistrictsService } from './districts.service';
import { DistrictsController } from './districts.controller';
import { District } from './entities/district.entity';
import { Province } from '../provinces/entities/province.entity';
import { Post } from '../posts/entities/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([District, Province, Post])],
  providers: [DistrictsService],
  controllers: [DistrictsController],
  exports: [DistrictsService],
})
export class DistrictsModule {}
