import { Module } from '@nestjs/common';
import { S3Module } from 'src/lib/s3/s3.module';
import { RepositoriesModule } from 'src/repositories/repositories.module';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  imports: [S3Module, RepositoriesModule],
  providers: [PostsService],
  controllers: [PostsController],
})
export class PostsModule {}
