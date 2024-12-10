import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';

@Module({
  imports: [RepositoriesModule],
  providers: [ReportService],
  controllers: [ReportController],
})
export class ReportModule {}
