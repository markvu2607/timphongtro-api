import { Module } from '@nestjs/common';

import { RepositoriesModule } from 'src/repositories/repositories.module';
import { PaymentPackagesController } from './payment-packages.controller';
import { PaymentPackagesService } from './payment-packages.service';

@Module({
  imports: [RepositoriesModule],
  controllers: [PaymentPackagesController],
  providers: [PaymentPackagesService],
  exports: [PaymentPackagesService],
})
export class PaymentPackagesModule {}
