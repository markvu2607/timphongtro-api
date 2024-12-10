import { PaginationResponseDto } from 'src/common/dtos/responses/pagination.response.dto';
import { PostResponseDto } from './post.response.dto';

export class PaginatedPostsResponseDto extends PaginationResponseDto<PostResponseDto> {}
