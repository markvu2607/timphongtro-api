import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { S3Module } from 'src/lib/s3/s3.module';
import { DistrictsModule } from '../districts/districts.module';
import { ProvincesModule } from '../provinces/provinces.module';
import { UsersModule } from '../users/users.module';
import { PostImage } from './entities/post-images.entity';
import { Post } from './entities/post.entity';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, PostImage]),
    DistrictsModule,
    ProvincesModule,
    UsersModule,
    S3Module,
  ],
  providers: [PostsService],
  controllers: [PostsController],
  exports: [PostsService],
})
export class PostsModule {}
