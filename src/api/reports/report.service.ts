import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { PaginatedReportsResponseDto } from './dtos/responses/get-reports.response.dto';
import { PaginationRequestDto } from 'src/common/dtos/requests/pagination.request.dto';
import { ReportResponseDto } from './dtos/responses/report.response.dto';
import { CreateReportRequestDto } from './dtos/requests/create-report.request.dto';
import { PostsService } from '../posts/posts.service';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    private readonly postsService: PostsService,
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

  async findOneById(id: string): Promise<Report | null> {
    return this.reportRepository.findOneBy({ id });
  }

  async create(createReportRequestDto: CreateReportRequestDto) {
    const post = await this.postsService.getPostById(
      createReportRequestDto.postId,
    );
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const report = new Report();
    report.reason = createReportRequestDto.reason;
    report.description = createReportRequestDto.description;
    report.post = post;

    return this.reportRepository.save(report);
  }

  async update(id: string, reportEntity: Omit<Report, 'id'>): Promise<Report> {
    await this.reportRepository.update(id, reportEntity);
    return this.findOneById(id);
  }

  async delete(id: string): Promise<void> {
    await this.reportRepository.delete(id);
  }
}
