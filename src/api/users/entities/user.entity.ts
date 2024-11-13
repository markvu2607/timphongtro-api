import { Account } from 'src/api/auth/entities/account.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsOptional } from 'class-validator';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  phone: string;

  @Column()
  bio: string;

  @Column()
  isVerified: boolean;

  @Column({ default: null })
  @IsOptional()
  verificationToken: string;

  @Column({ default: null })
  @IsOptional()
  tokenExpiration: Date;

  @OneToOne(() => Account, (account) => account.user)
  account: Account;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
