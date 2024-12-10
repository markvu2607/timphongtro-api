import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsEmail, IsOptional } from 'class-validator';
import { ERole } from '../../auth/enums/role.enum';
import { Exclude } from 'class-transformer';

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
  @Exclude()
  verificationToken: string;

  @Column({ default: null })
  @IsOptional()
  @Exclude()
  tokenExpiration: Date;

  @CreateDateColumn()
  @Exclude()
  createdAt: Date;

  @UpdateDateColumn()
  @Exclude()
  updatedAt: Date;

  @DeleteDateColumn()
  @Exclude()
  deletedAt: Date;
}
