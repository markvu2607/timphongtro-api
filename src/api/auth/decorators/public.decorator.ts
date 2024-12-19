import { SetMetadata } from '@nestjs/common';
import { MetadataKey } from 'src/common/constants';

export const Public = () => SetMetadata(MetadataKey.IS_PUBLIC_ROUTE, true);
