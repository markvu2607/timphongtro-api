import { District } from '../../entities/district.entity';

export class DistrictResponseDto {
  public id: string;
  public name: string;

  constructor(district: District) {
    this.id = district.id;
    this.name = district.name;
  }
}
