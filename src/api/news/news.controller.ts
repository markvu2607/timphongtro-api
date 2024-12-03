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
import { Roles } from '../auth/decorators/roles.decorator';
import { ERole } from '../auth/enums/role.enum';
import { Public } from '../auth/decorators/public.decorator';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  @Public()
  async findAll() {
    return this.newsService.findAll();
  }

  @Get(':id')
  @Public()
  async findOneById(@Param('id') id: string) {
    return this.newsService.findOneById(id);
  }

  @Post()
  @Roles(ERole.ADMIN)
  async create(@Body() newEntity: Omit<New, 'id'>) {
    return this.newsService.create(newEntity);
  }

  @Put(':id')
  @Roles(ERole.ADMIN)
  async update(@Param('id') id: string, @Body() newEntity: Omit<New, 'id'>) {
    return this.newsService.update(id, newEntity);
  }

  @Delete(':id')
  @Roles(ERole.ADMIN)
  async delete(@Param('id') id: string) {
    return this.newsService.delete(id);
  }
}
