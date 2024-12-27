import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationRequestDto } from 'src/common/dtos/requests/pagination.request.dto';
import { S3Service } from 'src/lib/s3/s3.service';
import { News, Province } from 'src/repositories/entities';
import { Repository } from 'typeorm';
import { CreateNewsRequestDto } from './dtos/requests/create-news.request.dto';
import { UpdateNewsRequestDto } from './dtos/requests/update-news.request.dto';
import { ENewStatus } from 'src/common/enums/news-status.enum';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private readonly newsRepository: Repository<News>,
    @InjectRepository(Province)
    private readonly provinceRepository: Repository<Province>,
    private readonly s3Service: S3Service,
  ) {}

  async findAllPublished(query: PaginationRequestDto): Promise<{
    news: News[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page, limit, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.newsRepository.createQueryBuilder('news');

    queryBuilder.where('news.status = :status', {
      status: ENewStatus.PUBLISHED,
    });

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

  async findPublishedPostById(id: string): Promise<News> {
    const news = this.newsRepository.findOne({
      where: { id, status: ENewStatus.PUBLISHED },
      relations: ['province'],
    });

    if (!news) {
      throw new NotFoundException('News not found');
    }

    return news;
  }

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

  async findOneById(id: string): Promise<News> {
    const news = this.newsRepository.findOne({
      where: { id },
      relations: ['province'],
    });

    if (!news) {
      throw new NotFoundException('News not found');
    }

    return news;
  }

  async create(
    createNewsRequestDto: CreateNewsRequestDto,
    thumbnail: Express.Multer.File[],
  ): Promise<News> {
    const { provinceId, ...rest } = createNewsRequestDto;

    if (!thumbnail || thumbnail.length === 0) {
      throw new BadRequestException('No thumbnail provided');
    }

    if (provinceId) {
      const province = await this.provinceRepository.findOneBy({
        id: provinceId,
      });
      if (!province) {
        throw new NotFoundException('Province not found');
      }
    }

    const key = await this.s3Service.uploadFile(
      thumbnail[0].originalname,
      thumbnail[0].buffer,
    );
    const thumbnailUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    const news = this.newsRepository.create({
      ...rest,
      province: provinceId ? { id: provinceId } : null,
      thumbnail: thumbnailUrl,
    });

    console.log(news);
    return this.newsRepository.save(news);
  }

  async update(
    id: string,
    updateNewsRequestDto: UpdateNewsRequestDto,
    thumbnail: Express.Multer.File[],
  ): Promise<News> {
    const news = await this.findOneById(id);
    if (!news) {
      throw new NotFoundException('News not found');
    }

    const { provinceId, ...rest } = updateNewsRequestDto;

    let province = news.province;
    if (provinceId) {
      province = await this.provinceRepository.findOneBy({
        id: provinceId,
      });
      if (!province) {
        throw new NotFoundException('Province not found');
      }
    }

    if (thumbnail[0]) {
      const key = await this.s3Service.uploadFile(
        thumbnail[0].originalname,
        thumbnail[0].buffer,
      );

      const oldThumbnailKey = news.thumbnail.split('/').pop();
      if (oldThumbnailKey) {
        await this.s3Service.deleteFile(oldThumbnailKey);
      }

      news.thumbnail = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    }

    try {
      await this.newsRepository.update(id, {
        ...news,
        ...rest,
        province,
      });
      return this.findOneById(id);
    } catch {
      throw new InternalServerErrorException('Failed to update news');
    }
  }

  async delete(id: string): Promise<void> {
    const news = await this.findOneById(id);
    if (!news) {
      throw new NotFoundException('News not found');
    }

    try {
      const key = news.thumbnail.split('/').pop();
      await Promise.all([
        this.s3Service.deleteFile(key),
        this.newsRepository.delete(id),
      ]);
      return;
    } catch {
      throw new BadRequestException('Cannot delete news');
    }
  }

  async publish(id: string): Promise<void> {
    const news = await this.findOneById(id);
    if (!news) {
      throw new NotFoundException('News not found');
    }

    if (news.status === ENewStatus.PUBLISHED) {
      throw new BadRequestException('News already published');
    }

    try {
      await this.newsRepository.update(id, {
        status: ENewStatus.PUBLISHED,
        publishedAt: new Date(),
      });
      return;
    } catch {
      throw new InternalServerErrorException('Failed to publish news');
    }
  }

  async unpublish(id: string): Promise<void> {
    const news = await this.findOneById(id);
    if (!news) {
      throw new NotFoundException('News not found');
    }

    if (news.status === ENewStatus.DRAFT) {
      throw new BadRequestException('News already unpublished');
    }

    try {
      await this.newsRepository.update(id, {
        status: ENewStatus.DRAFT,
        publishedAt: null,
      });
      return;
    } catch {
      throw new InternalServerErrorException('Failed to publish news');
    }
  }
}
