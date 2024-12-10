import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PaginationRequestDto } from 'src/common/dtos/requests/pagination.request.dto';
import { ERole } from 'src/common/enums/role.enum';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateProvinceRequestDto } from './dtos/requests/create-province.request.dto';
import { UpdateProvinceRequestDto } from './dtos/requests/update-province.request.dto';
import { PaginatedProvincesResponseDto } from './dtos/responses/get-provinces.response.dto';
import { ProvinceResponseDto } from './dtos/responses/province.response.dto';
import { ProvincesService } from './provinces.service';

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
  async create(
    @Body() createProvinceRequestDto: CreateProvinceRequestDto,
  ): Promise<ProvinceResponseDto> {
    const createdProvince = await this.provincesService.create(
      createProvinceRequestDto,
    );
    return new ProvinceResponseDto(createdProvince);
  }

  @Roles(ERole.ADMIN)
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateProvinceRequestDto: UpdateProvinceRequestDto,
  ): Promise<ProvinceResponseDto> {
    const updatedProvince = await this.provincesService.update(
      id,
      updateProvinceRequestDto,
    );
    return new ProvinceResponseDto(updatedProvince);
  }

  @Roles(ERole.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.provincesService.delete(id);
    return;
  }
}
