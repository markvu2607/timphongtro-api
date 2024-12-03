import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { New } from './entities/new.entity';
import { NewsService } from './news.service';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  async findAll() {
    return this.newsService.findAll();
  }

  @Get(':id')
  async findOneById(@Param('id') id: string) {
    return this.newsService.findOneById(id);
  }

  @Post()
  async create(@Body() newEntity: Omit<New, 'id'>) {
    return this.newsService.create(newEntity);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() newEntity: Omit<New, 'id'>) {
    return this.newsService.update(id, newEntity);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.newsService.delete(id);
  }
}
