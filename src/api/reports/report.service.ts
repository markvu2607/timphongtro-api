import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
  ) {}

  async findAll(): Promise<Report[]> {
    return this.reportRepository.find();
  }

  async findOneById(id: string): Promise<Report | null> {
    return this.reportRepository.findOneBy({ id });
  }

  async create(reportEntity: Omit<Report, 'id'>): Promise<Report> {
    return this.reportRepository.save(reportEntity);
  }

  async update(id: string, reportEntity: Omit<Report, 'id'>): Promise<Report> {
    await this.reportRepository.update(id, reportEntity);
    return this.findOneById(id);
  }

  async delete(id: string): Promise<void> {
    await this.reportRepository.delete(id);
  }
}
