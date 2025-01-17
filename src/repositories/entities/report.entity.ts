import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { EReportStatus } from 'src/common/enums/report-status.enum';
import { Post } from '.';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  reason: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255 })
  phone: string;

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
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
