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
} from '@nestjs/common';
import { Province } from './entities/province.entity';
import { ProvincesService } from './provinces.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { ERole } from '../auth/enums/role.enum';
import { Public } from '../auth/decorators/public.decorator';
import { PaginationRequestDto } from 'src/common/dtos/requests/pagination.request.dto';
import { PaginatedProvincesResponseDto } from './dtos/responses/get-provinces.response.dto';
import { ProvinceResponseDto } from './dtos/responses/province.response.dto';

@Controller('provinces')
export class ProvincesController {
  constructor(private readonly provincesService: ProvincesService) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: PaginationRequestDto,
  ): Promise<PaginatedProvincesResponseDto> {
    const { provinces, total, page, limit } =
      await this.provincesService.findAll(query);

    return new PaginatedProvincesResponseDto({
      items: provinces.map((province) => new ProvinceResponseDto(province)),
      total,
      page,
      limit,
    });
  }

  @Public()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOneById(@Param('id') id: string): Promise<ProvinceResponseDto> {
    const province = await this.provincesService.findOneById(id);
    return new ProvinceResponseDto(province);
  }

  @Roles(ERole.ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() province: Omit<Province, 'id'>) {
    return this.provincesService.create(province);
  }

  @Roles(ERole.ADMIN)
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() province: Omit<Province, 'id'>,
  ) {
    return this.provincesService.update(id, province);
  }

  @Roles(ERole.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    return this.provincesService.delete(id);
  }
}
