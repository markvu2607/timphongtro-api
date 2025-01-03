import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { ERole } from 'src/common/enums/role.enum';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  @Roles(ERole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async getAnalytics(
    @Query() query: { startDate: string; endDate: string; provinceId: string },
  ) {
    return await this.analyticsService.getAnalytics(query);
  }
}
