import { Module } from '@nestjs/common';

import { S3Module } from 'src/lib/s3/s3.module';
import { RepositoriesModule } from 'src/repositories/repositories.module';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { StripeModule } from 'src/lib/stripe/stripe.module';

@Module({
  imports: [S3Module, StripeModule, RepositoriesModule],
  providers: [PostsService],
  controllers: [PostsController],
  exports: [PostsService],
})
export class PostsModule {}
