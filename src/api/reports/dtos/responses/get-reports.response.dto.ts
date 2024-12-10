import { PaginationResponseDto } from 'src/common/dtos/responses/pagination.response.dto';
import { ReportResponseDto } from './report.response.dto';

export class PaginatedReportsResponseDto extends PaginationResponseDto<ReportResponseDto> {}
