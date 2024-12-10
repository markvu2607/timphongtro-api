import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '../posts/entities/post.entity';
import { Province } from '../provinces/entities/province.entity';
import { DistrictsController } from './districts.controller';
import { DistrictsService } from './districts.service';
import { District } from './entities/district.entity';

@Module({
  imports: [TypeOrmModule.forFeature([District, Province, Post])],
  providers: [DistrictsService],
  controllers: [DistrictsController],
  exports: [DistrictsService],
})
export class DistrictsModule {}
