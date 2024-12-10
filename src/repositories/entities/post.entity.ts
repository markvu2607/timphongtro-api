import { Exclude } from 'class-transformer';
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
import { District, Province, Report, User } from '.';
import { PostImage } from './post-images.entity';

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
