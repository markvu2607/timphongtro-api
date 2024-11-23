import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { compare, genSalt, hash } from 'bcryptjs';
import { HashingService } from './hashing.service';

@Injectable()
export class BcryptService implements HashingService {
  constructor(private readonly configService: ConfigService) {}

  async hash(data: string): Promise<string> {
    if (!data) {
      throw new Error('Data to hash cannot be empty!');
    }

    const saltRounds = this.configService.get('hashing.bcrypt.rounds');
    const salt = await genSalt(saltRounds);
    return hash(data, salt);
  }

  compare(data: string, encrypted: string): Promise<boolean> {
    if (!data || !encrypted) {
      throw new Error('Both data and encrypted value are required!');
    }
    return compare(data, encrypted);
  }
}
