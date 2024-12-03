import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { New } from './entities/new.entity';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(New)
    private readonly newsRepository: Repository<New>,
  ) {}

  async findAll(): Promise<New[]> {
    return this.newsRepository.find();
  }

  async findOneById(id: string): Promise<New | null> {
    return this.newsRepository.findOneBy({ id });
  }

  async create(newEntity: Omit<New, 'id'>): Promise<New> {
    return this.newsRepository.save(newEntity);
  }

  async update(id: string, newEntity: Omit<New, 'id'>): Promise<New> {
    await this.newsRepository.update(id, newEntity);
    return this.findOneById(id);
  }

  async delete(id: string): Promise<void> {
    await this.newsRepository.delete(id);
  }
}
