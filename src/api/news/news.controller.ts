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
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { ERole } from '../auth/enums/role.enum';
import { CreateNewsRequestDto } from './dtos/requests/create-news.request.dto';
import { PaginatedNewsResponseDto } from './dtos/responses/get-list-news.response.dto';
import { NewsResponseDto } from './dtos/responses/news.response.dto';
import { News } from './entities/news.entity';
import { NewsService } from './news.service';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Public()
  @Get()
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
  async findOneById(@Param('id') id: string) {
    return this.newsService.findOneById(id);
  }

  @Roles(ERole.ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor('thumbnail', 1))
  async create(
    @Body() createNewsRequestDto: CreateNewsRequestDto,
    @UploadedFiles() thumbnail: Express.Multer.File[],
  ): Promise<NewsResponseDto> {
    return this.newsService.create(createNewsRequestDto, thumbnail);
  }

  @Roles(ERole.ADMIN)
  @Put(':id')
  async update(@Param('id') id: string, @Body() news: Omit<News, 'id'>) {
    return this.newsService.update(id, news);
  }

  @Roles(ERole.ADMIN)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.newsService.delete(id);
  }
}
