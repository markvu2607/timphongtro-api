import { SetMetadata } from '@nestjs/common';
import { MetadataKey } from 'src/common/constants/metadata-key.constant';
import { ERole } from 'src/common/enums/role.enum';

export const Roles = (...roles: ERole[]) =>
  SetMetadata(MetadataKey.ROLES, roles);
