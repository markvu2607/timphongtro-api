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
import { ERole } from '../auth/enums/role.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('districts')
export class DistrictsController {
  constructor(private readonly districtsService: DistrictsService) {}

  @Get()
  @Public()
  async findAll() {
    return this.districtsService.findAll();
  }

  @Get(':id')
  @Public()
  async findOneById(@Param('id') id: string) {
    return this.districtsService.findOneById(id);
  }

  @Post()
  @Roles(ERole.ADMIN)
  async create(@Body() district: Omit<District, 'id'>) {
    return this.districtsService.create(district);
  }

  @Put(':id')
  @Roles(ERole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() district: Omit<District, 'id'>,
  ) {
    return this.districtsService.update(id, district);
  }

  @Delete(':id')
  @Roles(ERole.ADMIN)
  async delete(@Param('id') id: string) {
    return this.districtsService.delete(id);
  }
}
