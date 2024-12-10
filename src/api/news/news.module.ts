import { Module } from '@nestjs/common';
import { S3Module } from 'src/lib/s3/s3.module';
import { RepositoriesModule } from 'src/repositories/repositories.module';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';

@Module({
  imports: [S3Module, RepositoriesModule],
  providers: [NewsService],
  controllers: [NewsController],
})
export class NewsModule {}
