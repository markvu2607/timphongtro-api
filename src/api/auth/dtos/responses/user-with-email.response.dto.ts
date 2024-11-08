import { Account } from '../../entities/account.entity';

export class UserWithEmailResponseDto {
  public email: string;
  public firstName: string;
  public lastName: string;
  public phone: string;
  public bio: string;
  public isVerified: boolean;

  constructor(account: Account) {
    if (!account?.user) {
      throw new Error('Invalid account data.');
    }
    this.email = account.email;
    this.firstName = account.user.firstName;
    this.lastName = account.user.lastName;
    this.phone = account.user.phone;
    this.bio = account.user.bio;
    this.isVerified = account.user.isVerified;
  }
}
