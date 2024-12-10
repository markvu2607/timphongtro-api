import { Province } from 'src/repositories/entities';

export class ProvinceResponseDto {
  public id: string;
  public name: string;

  constructor(province: Province) {
    this.id = province.id;
    this.name = province.name;
  }
}
