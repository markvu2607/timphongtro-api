import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { Province } from './entities/province.entity';
import { ProvincesService } from './provinces.service';

@Controller('provinces')
export class ProvincesController {
  constructor(private readonly provincesService: ProvincesService) {}

  @Get()
  async findAll() {
    return this.provincesService.findAll();
  }

  @Get(':id')
  async findOneById(@Param('id') id: string) {
    return this.provincesService.findOneById(id);
  }

  @Post()
  async create(@Body() province: Omit<Province, 'id'>) {
    return this.provincesService.create(province);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() province: Omit<Province, 'id'>,
  ) {
    return this.provincesService.update(id, province);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.provincesService.delete(id);
  }
}
