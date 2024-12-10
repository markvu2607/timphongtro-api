import { PartialType } from '@nestjs/mapped-types';
import { CreateNewsRequestDto } from './create-news.request.dto';

export class UpdateNewsRequestDto extends PartialType(CreateNewsRequestDto) {}
