import { PostImage } from 'src/repositories/entities';

export class PostImageResponseDto {
  public id: string;
  public url: string;
  public key: string;

  constructor(postImage: PostImage) {
    this.id = postImage.id;
    this.url = postImage.url;
    this.key = postImage.key;
  }
}
