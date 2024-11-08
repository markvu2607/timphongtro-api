import { Controller, Get } from '@nestjs/common';
import { Public } from './api/auth/decorators/public.decorator';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get('health-check')
  healthCheck(): string {
    return this.appService.healthCheck();
  }
}
