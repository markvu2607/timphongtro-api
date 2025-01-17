import { User } from 'src/repositories/entities';

export class UserResponseDto {
  public id: string;
  public email: string;
  public name: string;
  public phone: string;
  public isVerified: boolean;
  public avatar: string | null;

  constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
    this.name = user.name;
    this.phone = user.phone;
    this.isVerified = user.isVerified;
    this.avatar = user.avatar;
  }
}
