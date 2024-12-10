import { PaginationResponseDto } from 'src/common/dtos/responses/pagination.response.dto';
import { NewsResponseDto } from './news.response.dto';

export class PaginatedNewsResponseDto extends PaginationResponseDto<NewsResponseDto> {}
