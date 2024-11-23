import { UserResponseDto } from '../../../users/dtos/responses/user.response.dto';

export class SignUpResponseDto {
  public user: UserResponseDto;
  public accessToken: string;

  constructor({
    user,
    accessToken,
  }: {
    user: UserResponseDto;
    accessToken: string;
  }) {
    this.user = user;
    this.accessToken = accessToken;
  }
}
