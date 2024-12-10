import { PartialType } from '@nestjs/mapped-types';
import { CreateDistrictRequestDto } from './create-district.request.dto';

export class UpdateDistrictRequestDto extends PartialType(
  CreateDistrictRequestDto,
) {}
