import { Exclude } from 'class-transformer';
import { District } from 'src/api/districts/entities/district.entity';
import { News } from 'src/api/news/entities/news.entity';
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

  @OneToMany(() => News, (news) => news.province)
  news: News[];

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
