import { ProvinceResponseDto } from 'src/api/provinces/dtos/responses/province.response.dto';
import { District } from '../../entities/district.entity';

export class DistrictResponseDto {
  public id: string;
  public name: string;
  public province: ProvinceResponseDto;

  constructor(district: District) {
    this.id = district.id;
    this.name = district.name;
    this.province = district.province;
  }
}
