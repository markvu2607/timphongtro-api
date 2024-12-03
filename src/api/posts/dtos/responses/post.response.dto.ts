import { DistrictResponseDto } from 'src/api/districts/dtos/responses/district.response.dto';
import { ProvinceResponseDto } from 'src/api/provinces/dtos/responses/province.response.dto';
import { UserResponseDto } from 'src/api/users/dtos/responses/user.response.dto';
import { Post } from '../../entities/post.entity';
import { PostImageResponseDto } from './post-image.response.dto';

export class PostResponseDto {
  public id: string;
  public title: string;
  public description: string;
  public createdAt: Date;
  public thumbnail: string;
  public address: string;
  public longitude: number;
  public latitude: number;
  public district: DistrictResponseDto;
  public province: ProvinceResponseDto;
  public user: UserResponseDto;
  public postImages: PostImageResponseDto[];

  constructor(post: Post) {
    this.id = post.id;
    this.title = post.title;
    this.description = post.description;
    this.createdAt = post.createdAt;
    this.thumbnail = post.thumbnail;
    this.address = post.address;
    this.longitude = post.longitude;
    this.latitude = post.latitude;
    this.district = post.district;
    this.province = post.province;
    this.user = post.user;
    this.postImages = post.postImages;
  }
}
