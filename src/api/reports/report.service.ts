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
import { UpdateReportRequestDto } from './dtos/requests/update-report.request.dto';

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

    queryBuilder.where('report.deletedAt IS NULL');

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

  async update(
    id: string,
    updateReportRequestDto: UpdateReportRequestDto,
  ): Promise<Report> {
    const report = await this.findOneById(id);
    if (!report) {
      throw new NotFoundException('Report not found');
    }

    const { postId, ...rest } = updateReportRequestDto;

    let post = report.post;
    if (postId) {
      post = await this.postsRepository.findOne({
        where: { id: postId, deletedAt: IsNull() },
      });
      if (!post) {
        throw new NotFoundException('Post not found');
      }
    }

    try {
      await this.reportRepository.update(id, { ...rest, post });
      return this.findOneById(id);
    } catch (error) {
      throw new InternalServerErrorException('Failed to update report');
    }
  }

  async delete(id: string): Promise<void> {
    await this.reportRepository.softDelete(id);
  }
}
