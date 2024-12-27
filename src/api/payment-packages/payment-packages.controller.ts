import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';

import { Public } from '../auth/decorators/public.decorator';
import { PaymentPackageResponseDto } from './dtos/responses/payment-package.response.dto';
import { PaymentPackagesService } from './payment-packages.service';

@Controller('payment-packages')
export class PaymentPackagesController {
  constructor(
    private readonly paymentPackagesService: PaymentPackagesService,
  ) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    const paymentPackages = await this.paymentPackagesService.findAll();
    return paymentPackages.map(
      (paymentPackage) => new PaymentPackageResponseDto(paymentPackage),
    );
  }
}
