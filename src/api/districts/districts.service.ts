import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { District } from './entities/district.entity';

@Injectable()
export class DistrictsService {
  constructor(
    @InjectRepository(District)
    private readonly districtsRepository: Repository<District>,
  ) {}

  async findAll(): Promise<District[]> {
    return this.districtsRepository.find();
  }

  async findOneById(id: string): Promise<District | null> {
    return this.districtsRepository.findOneBy({ id });
  }

  async create(district: Omit<District, 'id'>): Promise<District> {
    return this.districtsRepository.save(district);
  }

  async update(id: string, district: Omit<District, 'id'>): Promise<District> {
    await this.districtsRepository.update(id, district);
    return this.findOneById(id);
  }

  async delete(id: string): Promise<void> {
    await this.districtsRepository.delete(id);
  }
}
