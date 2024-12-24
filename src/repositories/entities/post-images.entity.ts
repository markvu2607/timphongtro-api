import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Post } from '.';

@Entity('post_images')
export class PostImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  key: string;

  @Column({ length: 255 })
  url: string;

  @ManyToOne(() => Post, (post) => post.id)
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
