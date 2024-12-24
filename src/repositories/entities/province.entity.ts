import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { District, News, Post } from '.';

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
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
