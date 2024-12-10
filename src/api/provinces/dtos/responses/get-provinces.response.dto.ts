import { PaginationResponseDto } from 'src/common/dtos/responses/pagination.response.dto';
import { ProvinceResponseDto } from './province.response.dto';

export class PaginatedProvincesResponseDto extends PaginationResponseDto<ProvinceResponseDto> {}
