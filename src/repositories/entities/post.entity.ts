import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { EPostStatus } from 'src/common/enums/post-status.enum';
import { District, PaymentPackage, Province, Report, User, PostImage } from '.';

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
  area: number;

  @Column()
  price: number;

  @Column({ type: 'float' })
  longitude: number;

  @Column({ type: 'float' })
  latitude: number;

  @Column({ type: 'enum', enum: EPostStatus, default: EPostStatus.REVIEWING })
  status: string;

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

  @ManyToOne(() => PaymentPackage, (paymentPackage) => paymentPackage.id)
  @JoinColumn({ name: 'payment_package_id' })
  paymentPackage: PaymentPackage;

  @Column({ type: 'timestamp', default: null, nullable: true })
  publishedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
