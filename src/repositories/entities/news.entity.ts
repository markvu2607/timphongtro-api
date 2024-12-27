import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Province } from '.';
import { ENewStatus } from 'src/common/enums/news-status.enum';

@Entity('news')
export class News {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ length: 255 })
  thumbnail: string;

  @Column({ type: 'text' })
  shortDescription: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'enum', enum: ENewStatus, default: ENewStatus.DRAFT })
  status: string;

  @Column({ type: 'timestamp', default: null, nullable: true })
  publishedAt: Date;

  @ManyToOne(() => Province, (province) => province.id, { nullable: true })
  @JoinColumn({ name: 'province_id' })
  province?: Province;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
