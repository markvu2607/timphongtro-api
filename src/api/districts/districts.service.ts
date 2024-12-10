import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { District } from './entities/district.entity';
import { PaginationRequestDto } from 'src/common/dtos/requests/pagination.request.dto';
import { PaginatedDistrictsResponseDto } from './dtos/responses/get-districts.response.dto';
import { DistrictResponseDto } from './dtos/responses/district.response.dto';

@Injectable()
export class DistrictsService {
  constructor(
    @InjectRepository(District)
    private readonly districtsRepository: Repository<District>,
  ) {}

  async findAll(
    query: PaginationRequestDto,
  ): Promise<PaginatedDistrictsResponseDto> {
    const { page, limit, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const queryBuilder =
      this.districtsRepository.createQueryBuilder('district');

    if (search) {
      queryBuilder.where({ name: Like(`%${search}%`) });
    }

    const [districts, total] = await queryBuilder
      .leftJoinAndSelect('district.province', 'province')
      .orderBy(`district.${sortBy}`, sortOrder)
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return new PaginatedDistrictsResponseDto({
      items: districts.map((district) => new DistrictResponseDto(district)),
      total,
      page,
      limit,
    });
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
