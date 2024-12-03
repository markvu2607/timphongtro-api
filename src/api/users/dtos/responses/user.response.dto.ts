import { User } from '../../entities/user.entity';

export class UserResponseDto {
  public email: string;
  public name: string;
  public phone: string;
  public isVerified: boolean;

  constructor(user: User) {
    this.email = user.email;
    this.name = user.name;
    this.phone = user.phone;
    this.isVerified = user.isVerified;
  }
}
