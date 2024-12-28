import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationRequestDto } from 'src/common/dtos/requests/pagination.request.dto';
import { Post, Report } from 'src/repositories/entities';
import { Like, Repository } from 'typeorm';
import { CreateReportRequestDto } from './dtos/requests/create-report.request.dto';
import { EReportStatus } from 'src/common/enums/report-status.enum';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {}

  async findAll(query: PaginationRequestDto): Promise<{
    reports: Report[];
    total: number;
    page: number;
    limit: number;
  }> {
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

    return {
      reports,
      total,
      page,
      limit,
    };
  }

  async findOneById(id: string): Promise<Report> {
    const report = await this.reportRepository.findOne({
      where: { id },
      relations: {
        post: true,
      },
    });
    if (!report) {
      throw new NotFoundException('Report not found');
    }
    return report;
  }

  async create(createReportRequestDto: CreateReportRequestDto) {
    const { postId, ...rest } = createReportRequestDto;

    const post = await this.postsRepository.findOne({
      where: { id: postId },
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const report = this.reportRepository.create({
      ...rest,
      post,
    });

    return this.reportRepository.save(report);
  }

  async delete(id: string): Promise<void> {
    const report = await this.reportRepository.findOneBy({ id });

    if (!report) {
      throw new NotFoundException('Report not found');
    }
    await this.reportRepository.delete(id);
  }

  async resolve(id: string): Promise<void> {
    const report = await this.reportRepository.findOneBy({ id });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    if (report.status !== EReportStatus.PENDING) {
      throw new Error('Report is not pending');
    }

    await this.reportRepository.update(id, { status: EReportStatus.RESOLVED });
  }

  async reject(id: string): Promise<void> {
    const report = await this.reportRepository.findOneBy({ id });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    if (report.status !== EReportStatus.PENDING) {
      throw new Error('Report is not pending');
    }

    await this.reportRepository.update(id, { status: EReportStatus.REJECTED });
  }
}
