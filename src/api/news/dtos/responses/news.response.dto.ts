import { ProvinceResponseDto } from 'src/api/provinces/dtos/responses/province.response.dto';
import { News } from 'src/repositories/entities';

export class NewsResponseDto {
  public id: string;
  public title: string;
  public thumbnail: { src: string };
  public shortDescription: string;
  public content: string;
  public province: ProvinceResponseDto;
  public status: string;
  public createdAt: Date;
  public publishedAt: Date;

  constructor(news: News) {
    this.id = news.id;
    this.title = news.title;
    this.thumbnail = { src: news.thumbnail };
    this.shortDescription = news.shortDescription;
    this.content = news.content;
    this.province = news.province;
    this.status = news.status;
    this.createdAt = news.createdAt;
    this.publishedAt = news.publishedAt;
  }
}
