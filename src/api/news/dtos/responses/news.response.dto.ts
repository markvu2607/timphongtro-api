import { ProvinceResponseDto } from 'src/api/provinces/dtos/responses/province.response.dto';
import { News } from 'src/repositories/entities';

export class NewsResponseDto {
  public id: string;
  public title: string;
  public thumbnail: string;
  public shortDescription: string;
  public content: string;
  public province: ProvinceResponseDto;

  constructor(news: News) {
    this.id = news.id;
    this.title = news.title;
    this.thumbnail = news.thumbnail;
    this.shortDescription = news.shortDescription;
    this.content = news.content;
    this.province = news.province;
  }
}
