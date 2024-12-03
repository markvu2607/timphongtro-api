import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { DistrictsService } from './districts.service';
import { District } from './entities/district.entity';

@Controller('districts')
export class DistrictsController {
  constructor(private readonly districtsService: DistrictsService) {}

  @Get()
  async findAll() {
    return this.districtsService.findAll();
  }

  @Get(':id')
  async findOneById(@Param('id') id: string) {
    return this.districtsService.findOneById(id);
  }

  @Post()
  async create(@Body() district: Omit<District, 'id'>) {
    return this.districtsService.create(district);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() district: Omit<District, 'id'>,
  ) {
    return this.districtsService.update(id, district);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.districtsService.delete(id);
  }
}
