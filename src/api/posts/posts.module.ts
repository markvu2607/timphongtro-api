import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';
import { PostImage } from './entities/post-images.entity';
import { Post } from './entities/post.entity';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { ProvincesService } from '../provinces/provinces.service';
import { DistrictsService } from '../districts/districts.service';
import { S3Service } from 'src/lib/s3/s3.service';
import { User } from '../users/entities/user.entity';
import { Province } from '../provinces/entities/province.entity';
import { District } from '../districts/entities/district.entity';
import { Report } from '../reports/entities/report.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Post,
      PostImage,
      User,
      District,
      Province,
      Report,
    ]),
  ],
  providers: [
    PostsService,
    UsersService,
    DistrictsService,
    ProvincesService,
    S3Service,
  ],
  controllers: [PostsController],
  exports: [PostsService],
})
export class PostsModule {}
