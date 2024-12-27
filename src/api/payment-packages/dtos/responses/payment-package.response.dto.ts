import { PaymentPackage } from 'src/repositories/entities';

export class PaymentPackageResponseDto {
  public id: string;
  public name: string;
  public description: string;
  public price: number;
  public currency: string;

  constructor(paymentPackage: PaymentPackage) {
    this.id = paymentPackage.id;
    this.name = paymentPackage.name;
    this.description = paymentPackage.description;
    this.price = paymentPackage.price;
    this.currency = paymentPackage.currency;
  }
}
