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
import { Roles } from '../auth/decorators/roles.decorator';
import { ERole } from '../auth/enums/role.enum';
import { Public } from '../auth/decorators/public.decorator';

@Controller('provinces')
export class ProvincesController {
  constructor(private readonly provincesService: ProvincesService) {}

  @Get()
  @Public()
  async findAll() {
    return this.provincesService.findAll();
  }

  @Get(':id')
  @Public()
  async findOneById(@Param('id') id: string) {
    return this.provincesService.findOneById(id);
  }

  @Post()
  @Roles(ERole.ADMIN)
  async create(@Body() province: Omit<Province, 'id'>) {
    return this.provincesService.create(province);
  }

  @Put(':id')
  @Roles(ERole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() province: Omit<Province, 'id'>,
  ) {
    return this.provincesService.update(id, province);
  }

  @Delete(':id')
  @Roles(ERole.ADMIN)
  async delete(@Param('id') id: string) {
    return this.provincesService.delete(id);
  }
}
