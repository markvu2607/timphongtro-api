import { DistrictResponseDto } from 'src/api/districts/dtos/responses/district.response.dto';
import { ProvinceResponseDto } from 'src/api/provinces/dtos/responses/province.response.dto';
import { UserResponseDto } from 'src/api/users/dtos/responses/user.response.dto';
import { Post } from 'src/repositories/entities';
import { PostImageResponseDto } from './post-image.response.dto';

export class PostResponseDto {
  public id: string;
  public title: string;
  public description: string;
  public createdAt: Date;
  public publishedAt: Date;
  public thumbnail: string;
  public address: string;
  public price: number;
  public area: number;
  public longitude: number;
  public latitude: number;
  public status: string;
  public district: DistrictResponseDto;
  public province: ProvinceResponseDto;
  public user: UserResponseDto;
  public postImages: PostImageResponseDto[];

  constructor(post: Post) {
    this.id = post.id;
    this.title = post.title;
    this.description = post.description;
    this.createdAt = post.createdAt;
    this.publishedAt = post.publishedAt;
    this.thumbnail = post.thumbnail;
    this.address = post.address;
    this.price = post.price;
    this.area = post.area;
    this.longitude = post.longitude;
    this.latitude = post.latitude;
    this.status = post.status;
    this.district = new DistrictResponseDto(post.district);
    this.province = new ProvinceResponseDto(post.province);
    this.user = new UserResponseDto(post.user);
    this.postImages = post.postImages.map(
      (postImage) => new PostImageResponseDto(postImage),
    );
  }
}
