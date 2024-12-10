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
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateReportRequestDto } from './dtos/requests/create-report.request.dto';
import { UpdateReportRequestDto } from './dtos/requests/update-report.request.dto';
import { PaginatedReportsResponseDto } from './dtos/responses/get-reports.response.dto';
import { ReportResponseDto } from './dtos/responses/report.response.dto';
import { ReportService } from './report.service';

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Roles(ERole.ADMIN)
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: PaginationRequestDto,
  ): Promise<PaginatedReportsResponseDto> {
    const { reports, total, page, limit } =
      await this.reportService.findAll(query);

    return new PaginatedReportsResponseDto({
      items: reports.map((report) => new ReportResponseDto(report)),
      total,
      page,
      limit,
    });
  }

  @Roles(ERole.ADMIN)
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOneById(@Param('id') id: string): Promise<ReportResponseDto> {
    const report = await this.reportService.findOneById(id);
    return new ReportResponseDto(report);
  }

  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createReportRequestDto: CreateReportRequestDto,
  ): Promise<ReportResponseDto> {
    const report = await this.reportService.create(createReportRequestDto);
    return new ReportResponseDto(report);
  }

  @Roles(ERole.ADMIN)
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateReportRequestDto: UpdateReportRequestDto,
  ): Promise<ReportResponseDto> {
    const report = await this.reportService.update(id, updateReportRequestDto);
    return new ReportResponseDto(report);
  }

  @Roles(ERole.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    return await this.reportService.delete(id);
  }
}
