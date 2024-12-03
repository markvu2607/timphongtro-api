import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { Report } from './entities/report.entity';
import { ReportService } from './report.service';

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get()
  async findAll() {
    return this.reportService.findAll();
  }

  @Get(':id')
  async findOneById(@Param('id') id: string) {
    return this.reportService.findOneById(id);
  }

  @Post()
  async create(@Body() reportEntity: Omit<Report, 'id'>) {
    return this.reportService.create(reportEntity);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() reportEntity: Omit<Report, 'id'>,
  ) {
    return this.reportService.update(id, reportEntity);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.reportService.delete(id);
  }
}
