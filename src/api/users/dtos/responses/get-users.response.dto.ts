import { PaginationResponseDto } from 'src/common/dtos/responses/pagination.response.dto';
import { UserResponseDto } from './user.response.dto';

export class PaginatedUsersResponseDto extends PaginationResponseDto<UserResponseDto> {}
