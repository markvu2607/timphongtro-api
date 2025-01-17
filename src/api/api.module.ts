import { Module } from '@nestjs/common';

import { AnalyticsModule } from './analytics/analytics.module';
import { AuthModule } from './auth/auth.module';
import { DistrictsModule } from './districts/districts.module';
import { NewsModule } from './news/news.module';
import { PostsModule } from './posts/posts.module';
import { ProvincesModule } from './provinces/provinces.module';
import { ReportModule } from './reports/report.module';
import { UsersModule } from './users/users.module';
import { WebhooksModule } from './webhooks/webhooks.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    PostsModule,
    DistrictsModule,
    ProvincesModule,
    ReportModule,
    NewsModule,
    WebhooksModule,
    AnalyticsModule,
  ],
})
export class ApiModule {}
