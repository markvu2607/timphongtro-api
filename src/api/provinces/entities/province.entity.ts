import { District } from 'src/api/districts/entities/district.entity';
import { New } from 'src/api/news/entities/new.entity';
import { Post } from 'src/api/posts/entities/post.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('provinces')
export class Province {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @OneToMany(() => District, (district) => district.province)
  districts: District[];

  @OneToMany(() => Post, (post) => post.province)
  posts: Post[];

  @OneToMany(() => New, (newEntity) => newEntity.province)
  news: New[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
