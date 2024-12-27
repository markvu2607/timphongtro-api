import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentPackage } from 'src/repositories/entities';
import { Repository } from 'typeorm';
import { CreatePaymentPackageRequestDto } from './dtos/requests/create-payment-package.request.dto';

@Injectable()
export class PaymentPackagesService {
  constructor(
    @InjectRepository(PaymentPackage)
    private readonly paymentPackagesRepository: Repository<PaymentPackage>,
  ) {}

  async findAll(): Promise<PaymentPackage[]> {
    return this.paymentPackagesRepository.find();
  }

  async findById(id: string): Promise<PaymentPackage> {
    return this.paymentPackagesRepository.findOneBy({ id });
  }

  async create(
    paymentPackage: CreatePaymentPackageRequestDto,
  ): Promise<PaymentPackage> {
    return this.paymentPackagesRepository.save(paymentPackage);
  }

  async update(
    id: string,
    paymentPackage: PaymentPackage,
  ): Promise<PaymentPackage> {
    await this.paymentPackagesRepository.update(id, paymentPackage);
    return this.paymentPackagesRepository.findOneBy({ id });
  }

  async delete(id: string): Promise<void> {
    await this.paymentPackagesRepository.delete(id);
  }
}
