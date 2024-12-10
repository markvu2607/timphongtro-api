import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationRequestDto } from 'src/common/dtos/requests/pagination.request.dto';
import { Repository } from 'typeorm';
import { Province } from './entities/province.entity';

@Injectable()
export class ProvincesService {
  constructor(
    @InjectRepository(Province)
    private readonly provincesRepository: Repository<Province>,
  ) {}

  async findAll(query: PaginationRequestDto): Promise<{
    provinces: Province[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page, limit, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const queryBuilder =
      this.provincesRepository.createQueryBuilder('province');

    if (search) {
      queryBuilder.where('province.name LIKE :search', {
        search: `%${search}%`,
      });
    }

    queryBuilder
      .orderBy(`province.${sortBy}`, sortOrder)
      .skip(skip)
      .take(limit);

    const [provinces, total] = await queryBuilder.getManyAndCount();

    return { provinces, total, page, limit };
  }

  async findOneById(id: string): Promise<Province | null> {
    const province = await this.provincesRepository.findOneBy({ id });
    if (!province) {
      throw new NotFoundException('Province not found');
    }
    return province;
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
