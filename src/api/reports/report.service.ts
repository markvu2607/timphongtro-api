import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationRequestDto } from 'src/common/dtos/requests/pagination.request.dto';
import { Post, Report } from 'src/repositories/entities';
import { IsNull, Like, Repository } from 'typeorm';
import { CreateReportRequestDto } from './dtos/requests/create-report.request.dto';
import { PaginatedReportsResponseDto } from './dtos/responses/get-reports.response.dto';
import { ReportResponseDto } from './dtos/responses/report.response.dto';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {}

  async findAll(
    query: PaginationRequestDto,
  ): Promise<PaginatedReportsResponseDto> {
    const { page, limit, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.reportRepository.createQueryBuilder('report');

    if (search) {
      queryBuilder.where({ reason: Like(`%${search}%`) });
    }

    queryBuilder
      .leftJoinAndSelect('report.post', 'post')
      .orderBy(`report.${sortBy}`, sortOrder)
      .skip(skip)
      .take(limit);

    const [reports, total] = await queryBuilder.getManyAndCount();

    return new PaginatedReportsResponseDto({
      items: reports.map((report) => new ReportResponseDto(report)),
      total,
      page,
      limit,
    });
  }

  async findOneById(id: string): Promise<Report> {
    const report = await this.reportRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!report) {
      throw new NotFoundException('Report not found');
    }
    return report;
  }

  async create(createReportRequestDto: CreateReportRequestDto) {
    const post = await this.postsRepository.findOne({
      where: { id: createReportRequestDto.postId, deletedAt: IsNull() },
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const report = this.reportRepository.create({
      reason: createReportRequestDto.reason,
      description: createReportRequestDto.description,
      post,
    });

    return this.reportRepository.save(report);
  }

  async update(id: string, reportEntity: Omit<Report, 'id'>): Promise<Report> {
    const report = await this.findOneById(id);
    if (!report) {
      throw new NotFoundException('Report not found');
    }

    try {
      await this.reportRepository.update(id, reportEntity);
      return this.findOneById(id);
    } catch (error) {
      throw new InternalServerErrorException('Failed to update report');
    }
  }

  async delete(id: string): Promise<void> {
    await this.reportRepository.delete(id);
  }
}
