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
import { Public } from '../auth/decorators/public.decorator';
import { ERole } from '../auth/enums/role.enum';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get()
  @Roles(ERole.ADMIN)
  async findAll() {
    return this.reportService.findAll();
  }

  @Get(':id')
  @Roles(ERole.ADMIN)
  async findOneById(@Param('id') id: string) {
    return this.reportService.findOneById(id);
  }

  @Post()
  @Public()
  async create(@Body() reportEntity: Omit<Report, 'id'>) {
    return this.reportService.create(reportEntity);
  }

  @Put(':id')
  @Roles(ERole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() reportEntity: Omit<Report, 'id'>,
  ) {
    return this.reportService.update(id, reportEntity);
  }

  @Delete(':id')
  @Roles(ERole.ADMIN)
  async delete(@Param('id') id: string) {
    return this.reportService.delete(id);
  }
}
