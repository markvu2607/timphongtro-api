import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { District } from '../districts/entities/district.entity';
import { News } from '../news/entities/news.entity';
import { Post } from '../posts/entities/post.entity';
import { Province } from './entities/province.entity';
import { ProvincesController } from './provinces.controller';
import { ProvincesService } from './provinces.service';

@Module({
  imports: [TypeOrmModule.forFeature([Province, News, Post, District])],
  providers: [ProvincesService],
  controllers: [ProvincesController],
  exports: [ProvincesService],
})
export class ProvincesModule {}
