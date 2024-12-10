import { PaginationResponseDto } from 'src/common/dtos/responses/pagination.response.dto';
import { DistrictResponseDto } from './district.response.dto';

export class PaginatedDistrictsResponseDto extends PaginationResponseDto<DistrictResponseDto> {}
