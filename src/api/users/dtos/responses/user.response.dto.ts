import { User } from '../../entities/user.entity';

export class UserResponseDto {
  public id: string;
  public email: string;
  public name: string;
  public phone: string;
  public isVerified: boolean;
  public avatar: string;

  constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
    this.name = user.name;
    this.phone = user.phone;
    this.isVerified = user.isVerified;
    this.avatar = user.avatar;
  }
}
