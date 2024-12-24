import { IsEmail, IsOptional } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ERole } from 'src/common/enums/role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @IsEmail()
  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({ type: 'enum', enum: ERole, default: ERole.USER })
  role: ERole;

  @Column()
  name: string;

  @Column()
  phone: string;

  @Column({ nullable: true, default: null })
  avatar: string;

  @Column()
  isVerified: boolean;

  @Column({ default: null })
  @IsOptional()
  verificationToken: string;

  @Column({ default: null })
  @IsOptional()
  tokenExpiration: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
