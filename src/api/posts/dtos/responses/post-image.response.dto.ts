import { PostImage } from '../../entities/post-images.entity';

export class PostImageResponseDto {
  public id: string;
  public url: string;

  constructor(postImage: PostImage) {
    this.id = postImage.id;
    this.url = postImage.url;
  }
}
