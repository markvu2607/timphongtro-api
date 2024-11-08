import { SetMetadata } from '@nestjs/common';
import { MetadataKey } from 'src/common/constants/metadata-key.constant';

export const Public = () => SetMetadata(MetadataKey.IS_PUBLIC_ROUTE, true);
