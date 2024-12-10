import { PartialType } from '@nestjs/mapped-types';
import { CreateProvinceRequestDto } from './create-province.request.dto';

export class UpdateProvinceRequestDto extends PartialType(
  CreateProvinceRequestDto,
) {}
