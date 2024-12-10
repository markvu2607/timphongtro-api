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
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { ERole } from 'src/common/enums/role.enum';
import { DistrictsService } from './districts.service';
import { CreateDistrictRequestDto } from './dtos/requests/create-district.request.dto';
import { UpdateDistrictRequestDto } from './dtos/requests/update-district.request.dto';
import { DistrictResponseDto } from './dtos/responses/district.response.dto';
import { PaginatedDistrictsResponseDto } from './dtos/responses/get-districts.response.dto';

@Controller('districts')
export class DistrictsController {
  constructor(private readonly districtsService: DistrictsService) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: PaginationRequestDto,
  ): Promise<PaginatedDistrictsResponseDto> {
    const { districts, total, page, limit } =
      await this.districtsService.findAll(query);

    return new PaginatedDistrictsResponseDto({
      items: districts.map((district) => new DistrictResponseDto(district)),
      total,
      page,
      limit,
    });
  }

  @Public()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOneById(@Param('id') id: string): Promise<DistrictResponseDto> {
    const district = await this.districtsService.findOneById(id);
    return new DistrictResponseDto(district);
  }

  @Roles(ERole.ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDistrictDto: CreateDistrictRequestDto,
  ): Promise<DistrictResponseDto> {
    const createdDistrict =
      await this.districtsService.create(createDistrictDto);
    return new DistrictResponseDto(createdDistrict);
  }

  @Roles(ERole.ADMIN)
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateDistrictDto: UpdateDistrictRequestDto,
  ): Promise<DistrictResponseDto> {
    const updatedDistrict = await this.districtsService.update(
      id,
      updateDistrictDto,
    );
    return new DistrictResponseDto(updatedDistrict);
  }

  @Roles(ERole.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.districtsService.delete(id);
    return;
  }
}
