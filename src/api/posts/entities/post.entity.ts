import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PostImage } from './post-images.entity';
import { Report } from 'src/api/reports/entities/report.entity';
import { User } from 'src/api/users/entities/user.entity';
import { District } from 'src/api/districts/entities/district.entity';
import { Province } from 'src/api/provinces/entities/province.entity';
import { Exclude } from 'class-transformer';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: true, default: null })
  thumbnail: string;

  @Column({ length: 255 })
  address: string;

  @Column()
  longitude: number;

  @Column()
  latitude: number;

  @ManyToOne(() => District, (district) => district.id)
  @JoinColumn({ name: 'district_id' })
  district: District;

  @ManyToOne(() => Province, (province) => province.id)
  @JoinColumn({ name: 'province_id' })
  province: Province;

  @OneToMany(() => PostImage, (postImage) => postImage.post)
  postImages: PostImage[];

  @OneToMany(() => Report, (report) => report.post)
  reports: Report[];

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;

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
