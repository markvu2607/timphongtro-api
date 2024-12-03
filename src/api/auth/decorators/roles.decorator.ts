import { SetMetadata } from '@nestjs/common';
import { MetadataKey } from 'src/common/constants/metadata-key.constant';
import { ERole } from '../enums/role.enum';

export const Roles = (...roles: ERole[]) =>
  SetMetadata(MetadataKey.ROLES, roles);
