import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PaginationRequestDto } from 'src/common/dtos/requests/pagination.request.dto';
import { ERole } from 'src/common/enums/role.enum';
import { Report } from 'src/repositories/entities';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateReportRequestDto } from './dtos/requests/create-report.request.dto';
import { PaginatedReportsResponseDto } from './dtos/responses/get-reports.response.dto';
import { ReportService } from './report.service';

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Roles(ERole.ADMIN)
  @Get()
  async findAll(
    @Query() query: PaginationRequestDto,
  ): Promise<PaginatedReportsResponseDto> {
    return this.reportService.findAll(query);
  }

  @Roles(ERole.ADMIN)
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOneById(@Param('id') id: string) {
    return this.reportService.findOneById(id);
  }

  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createReportRequestDto: CreateReportRequestDto) {
    return this.reportService.create(createReportRequestDto);
  }

  @Roles(ERole.ADMIN)
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() reportEntity: Omit<Report, 'id'>,
  ) {
    return this.reportService.update(id, reportEntity);
  }

  @Roles(ERole.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    return this.reportService.delete(id);
  }
}
