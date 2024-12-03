import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Province } from './entities/province.entity';

@Injectable()
export class ProvincesService {
  constructor(
    @InjectRepository(Province)
    private readonly provincesRepository: Repository<Province>,
  ) {}

  async findAll(): Promise<Province[]> {
    return this.provincesRepository.find();
  }

  async findOneById(id: string): Promise<Province | null> {
    return this.provincesRepository.findOneBy({ id });
  }

  async create(province: Omit<Province, 'id'>): Promise<Province> {
    return this.provincesRepository.save(province);
  }

  async update(id: string, province: Omit<Province, 'id'>): Promise<Province> {
    await this.provincesRepository.update(id, province);
    return this.findOneById(id);
  }

  async delete(id: string): Promise<void> {
    await this.provincesRepository.delete(id);
  }
}
