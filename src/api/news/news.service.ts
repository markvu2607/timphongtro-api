import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationRequestDto } from 'src/common/dtos/requests/pagination.request.dto';
import { S3Service } from 'src/lib/s3/s3.service';
import { News, Province } from 'src/repositories/entities';
import { Repository } from 'typeorm';
import { CreateNewsRequestDto } from './dtos/requests/create-news.request.dto';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private readonly newsRepository: Repository<News>,
    @InjectRepository(Province)
    private readonly provinceRepository: Repository<Province>,
    private readonly s3Service: S3Service,
  ) {}

  async findAll(query: PaginationRequestDto): Promise<{
    news: News[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page, limit, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.newsRepository.createQueryBuilder('news');

    if (search) {
      queryBuilder.where('news.title LIKE :search', {
        search: `%${search}%`,
      });
    }

    queryBuilder
      .orderBy(`news.${sortBy}`, sortOrder)
      .skip(skip)
      .take(limit)
      .leftJoinAndSelect('news.province', 'province');

    const [news, total] = await queryBuilder.getManyAndCount();

    return { news, total, page, limit };
  }

  async findOneById(id: string): Promise<News | null> {
    return this.newsRepository.findOneBy({ id });
  }

  async create(
    createNewsRequestDto: CreateNewsRequestDto,
    thumbnail: Express.Multer.File[],
  ): Promise<News> {
    const { provinceId, ...rest } = createNewsRequestDto;

    if (!thumbnail || thumbnail.length === 0) {
      throw new BadRequestException('No thumbnail provided');
    }

    const province = await this.provinceRepository.findOneBy({
      id: provinceId,
    });
    if (!province) {
      throw new NotFoundException('Province not found');
    }

    await this.s3Service.uploadFile(
      thumbnail[0].originalname,
      thumbnail[0].buffer,
    );
    const thumbnailUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${thumbnail[0].originalname}`;

    const news = this.newsRepository.create({
      ...rest,
      province,
      thumbnail: thumbnailUrl,
    });
    return this.newsRepository.save(news);
  }

  async update(id: string, news: Omit<News, 'id'>): Promise<News> {
    await this.newsRepository.update(id, news);
    return this.findOneById(id);
  }

  async delete(id: string): Promise<void> {
    await this.newsRepository.delete(id);
  }
}
