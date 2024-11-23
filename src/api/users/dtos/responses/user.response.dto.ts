import { User } from '../../entities/user.entity';

export class UserResponseDto {
  public email: string;
  public firstName: string;
  public lastName: string;
  public phone: string;
  public bio: string;
  public isVerified: boolean;

  constructor(user: User) {
    this.email = user.email;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.phone = user.phone;
    this.bio = user.bio;
    this.isVerified = user.isVerified;
  }
}
