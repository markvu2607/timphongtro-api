import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { DistrictsService } from './districts.service';
import { District } from './entities/district.entity';
import { ERole } from '../auth/enums/role.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { PaginationRequestDto } from 'src/common/dtos/requests/pagination.request.dto';
import { PaginatedDistrictsResponseDto } from './dtos/responses/get-districts.response.dto';

@Controller('districts')
export class DistrictsController {
  constructor(private readonly districtsService: DistrictsService) {}

  @Public()
  @Get()
  async findAll(
    @Query() query: PaginationRequestDto,
  ): Promise<PaginatedDistrictsResponseDto> {
    return this.districtsService.findAll(query);
  }

  @Public()
  @Get(':id')
  async findOneById(@Param('id') id: string) {
    return this.districtsService.findOneById(id);
  }

  @Roles(ERole.ADMIN)
  @Post()
  async create(@Body() district: Omit<District, 'id'>) {
    return this.districtsService.create(district);
  }

  @Roles(ERole.ADMIN)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() district: Omit<District, 'id'>,
  ) {
    return this.districtsService.update(id, district);
  }

  @Roles(ERole.ADMIN)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.districtsService.delete(id);
  }
}
