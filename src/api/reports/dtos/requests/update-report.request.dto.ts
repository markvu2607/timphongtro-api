import { PartialType } from '@nestjs/mapped-types';
import { CreateReportRequestDto } from './create-report.request.dto';

export class UpdateReportRequestDto extends PartialType(
  CreateReportRequestDto,
) {}
