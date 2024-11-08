import { UserWithEmailResponseDto } from './user-with-email.response.dto';

export class SignInResponseDto {
  public user: UserWithEmailResponseDto;
  public accessToken: string;

  constructor({
    user,
    accessToken,
  }: {
    user: UserWithEmailResponseDto;
    accessToken: string;
  }) {
    this.user = user;
    this.accessToken = accessToken;
  }
}
