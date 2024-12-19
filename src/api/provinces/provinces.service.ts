import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationRequestDto } from 'src/common/dtos/requests/pagination.request.dto';
import { District, News, Post, Province } from 'src/repositories/entities';
import { IsNull, Repository } from 'typeorm';
import { CreateProvinceRequestDto } from './dtos/requests/create-province.request.dto';
import { UpdateProvinceRequestDto } from './dtos/requests/update-province.request.dto';

@Injectable()
export class ProvincesService {
  constructor(
    @InjectRepository(Province)
    private readonly provincesRepository: Repository<Province>,
    @InjectRepository(District)
    private readonly districtsRepository: Repository<District>,
    @InjectRepository(News)
    private readonly newsRepository: Repository<News>,
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
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

    queryBuilder.where('province.deletedAt IS NULL');

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

  async findAllWithoutPagination(): Promise<Province[]> {
    return this.provincesRepository.find({ where: { deletedAt: IsNull() } });
  }

  async findOneById(id: string): Promise<Province> {
    const province = await this.provincesRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!province) {
      throw new NotFoundException('Province not found');
    }
    return province;
  }

  async create(
    createProvinceRequestDto: CreateProvinceRequestDto,
  ): Promise<Province> {
    try {
      const newProvince = this.provincesRepository.create(
        createProvinceRequestDto,
      );
      return this.provincesRepository.save(newProvince);
    } catch (error) {
      throw new InternalServerErrorException('Failed to create province');
    }
  }

  async update(
    id: string,
    updateProvinceRequestDto: UpdateProvinceRequestDto,
  ): Promise<Province> {
    const province = await this.findOneById(id);
    if (!province) {
      throw new NotFoundException('Province not found');
    }

    try {
      await this.provincesRepository.update(id, updateProvinceRequestDto);
      return this.findOneById(id);
    } catch (error) {
      throw new InternalServerErrorException('Failed to update province');
    }
  }

  async delete(id: string) {
    const province = await this.findOneById(id);
    if (!province) {
      throw new NotFoundException('Province not found');
    }

    const districts = await this.districtsRepository.find({
      where: { province: { id }, deletedAt: IsNull() },
    });
    if (districts.length > 0) {
      throw new BadRequestException('Cannot delete province with districts');
    }

    const news = await this.newsRepository.find({
      where: { province: { id }, deletedAt: IsNull() },
    });
    if (news.length > 0) {
      throw new BadRequestException('Cannot delete province with news');
    }

    const posts = await this.postsRepository.find({
      where: { province: { id }, deletedAt: IsNull() },
    });
    if (posts.length > 0) {
      throw new BadRequestException('Cannot delete province with posts');
    }

    try {
      await this.provincesRepository.softDelete(id);
      return;
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete province');
    }
  }
}
