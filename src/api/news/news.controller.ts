import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PaginationRequestDto } from 'src/common/dtos/requests/pagination.request.dto';
import { ERole } from 'src/common/enums/role.enum';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateNewsRequestDto } from './dtos/requests/create-news.request.dto';
import { UpdateNewsRequestDto } from './dtos/requests/update-news.request.dto';
import { PaginatedNewsResponseDto } from './dtos/responses/get-list-news.response.dto';
import { NewsResponseDto } from './dtos/responses/news.response.dto';
import { NewsService } from './news.service';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: PaginationRequestDto,
  ): Promise<PaginatedNewsResponseDto> {
    const { news, total, page, limit } = await this.newsService.findAll(query);

    return new PaginatedNewsResponseDto({
      items: news.map((news) => new NewsResponseDto(news)),
      total,
      page,
      limit,
    });
  }

  @Public()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOneById(@Param('id') id: string): Promise<NewsResponseDto> {
    const news = await this.newsService.findOneById(id);
    return new NewsResponseDto(news);
  }

  @Roles(ERole.ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor('thumbnail', 1))
  async create(
    @Body() createNewsRequestDto: CreateNewsRequestDto,
    @UploadedFiles() thumbnail: Express.Multer.File[],
  ): Promise<NewsResponseDto> {
    const news = await this.newsService.create(createNewsRequestDto, thumbnail);
    return new NewsResponseDto(news);
  }

  @Roles(ERole.ADMIN)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() news: UpdateNewsRequestDto,
  ): Promise<NewsResponseDto> {
    const updatedNews = await this.newsService.update(id, news);
    return new NewsResponseDto(updatedNews);
  }

  @Roles(ERole.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    return await this.newsService.delete(id);
  }
}
