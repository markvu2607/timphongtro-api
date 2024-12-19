import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationRequestDto } from 'src/common/dtos/requests/pagination.request.dto';
import { IsNull, Repository } from 'typeorm';
import { CreateDistrictRequestDto } from './dtos/requests/create-district.request.dto';
import { UpdateDistrictRequestDto } from './dtos/requests/update-district.request.dto';
import { District, Province, Post } from 'src/repositories/entities';

@Injectable()
export class DistrictsService {
  constructor(
    @InjectRepository(District)
    private readonly districtsRepository: Repository<District>,
    @InjectRepository(Province)
    private readonly provincesRepository: Repository<Province>,
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {}

  async findAll(query: PaginationRequestDto): Promise<{
    districts: District[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page, limit, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const queryBuilder =
      this.districtsRepository.createQueryBuilder('district');

    queryBuilder.where('district.deletedAt IS NULL');

    if (search) {
      queryBuilder.where('district.name LIKE :search', {
        search: `%${search}%`,
      });
    }

    const [districts, total] = await queryBuilder
      .leftJoinAndSelect('district.province', 'province')
      .orderBy(`district.${sortBy}`, sortOrder)
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { districts, total, page, limit };
  }

  async findAllWithoutPagination(): Promise<District[]> {
    return this.districtsRepository.find({ where: { deletedAt: IsNull() } });
  }

  async findOneById(id: string): Promise<District> {
    const district = await this.districtsRepository
      .createQueryBuilder('district')
      .leftJoinAndSelect('district.province', 'province')
      .where('district.id = :id', { id })
      .andWhere('district.deletedAt IS NULL')
      .getOne();
    if (!district) {
      throw new NotFoundException('District not found');
    }
    return district;
  }

  async create(
    createDistrictRequestDto: CreateDistrictRequestDto,
  ): Promise<District> {
    const { provinceId, ...rest } = createDistrictRequestDto;

    const province = await this.provincesRepository.findOne({
      where: { id: provinceId, deletedAt: IsNull() },
    });
    if (!province) {
      throw new NotFoundException('Province not found');
    }

    try {
      const newDistrict = this.districtsRepository.create({
        ...rest,
        province,
      });
      return this.districtsRepository.save(newDistrict);
    } catch (error) {
      throw new InternalServerErrorException('Failed to create district');
    }
  }

  async update(
    id: string,
    updateDistrictRequestDto: UpdateDistrictRequestDto,
  ): Promise<District> {
    const district = await this.findOneById(id);
    if (!district) {
      throw new NotFoundException('District not found');
    }

    const { provinceId, ...rest } = updateDistrictRequestDto;

    let province = district.province;
    if (provinceId) {
      province = await this.provincesRepository.findOne({
        where: { id: provinceId, deletedAt: IsNull() },
      });
      if (!province) {
        throw new NotFoundException('Province not found');
      }
    }

    try {
      await this.districtsRepository.update(id, {
        ...rest,
        province,
      });
      return this.findOneById(id);
    } catch (error) {
      throw new InternalServerErrorException('Failed to update district');
    }
  }

  async delete(id: string) {
    const district = await this.findOneById(id);
    if (!district) {
      throw new NotFoundException('District not found');
    }

    const posts = await this.postsRepository.find({
      where: { district: { id }, deletedAt: IsNull() },
    });
    if (posts.length > 0) {
      throw new BadRequestException('Cannot delete district with posts');
    }

    try {
      await this.districtsRepository.softDelete(id);
      return;
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete district');
    }
  }
}
