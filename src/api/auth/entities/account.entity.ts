import { User } from 'src/api/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from './role.entity';
import { IsEmail } from 'class-validator';

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @IsEmail()
  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ length: 255 })
  password: string;

  @OneToOne(() => User, (user) => user.account)
  @JoinColumn()
  user: User;

  @ManyToOne(() => Role, (role) => role.accounts)
  @JoinColumn()
  role: Role;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
