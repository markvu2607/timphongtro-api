import { Module } from '@nestjs/common';

import { RepositoriesModule } from 'src/repositories/repositories.module';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

@Module({
  imports: [RepositoriesModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
