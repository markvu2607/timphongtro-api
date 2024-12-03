import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DistrictsModule } from './districts/districts.module';
import { NewsModule } from './news/news.module';
import { PostsModule } from './posts/posts.module';
import { ProvincesModule } from './provinces/provinces.module';
import { ReportModule } from './reports/report.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    PostsModule,
    DistrictsModule,
    ProvincesModule,
    ReportModule,
    NewsModule,
  ],
})
export class ApiModule {}
