import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EReportStatus } from '../enums/report-status.enum';
import { Post } from 'src/api/posts/entities/post.entity';
import { Exclude } from 'class-transformer';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  reason: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: EReportStatus,
    default: EReportStatus.PENDING,
  })
  status: EReportStatus;

  @ManyToOne(() => Post, (post) => post.id)
  @JoinColumn({ name: 'post_id' })
  post: Post;

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
