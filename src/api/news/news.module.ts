import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { S3Module } from 'src/lib/s3/s3.module';
import { Province } from '../provinces/entities/province.entity';
import { ProvincesModule } from '../provinces/provinces.module';
import { News } from './entities/news.entity';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([News, Province]),
    ProvincesModule,
    S3Module,
  ],
  providers: [NewsService],
  controllers: [NewsController],
  exports: [NewsService],
})
export class NewsModule {}
