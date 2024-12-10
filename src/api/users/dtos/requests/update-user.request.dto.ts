import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserRequestDto } from './create-user.request.dto';

export class UpdateUserRequestDto extends PartialType(
  OmitType(CreateUserRequestDto, ['email', 'password']),
) {}
