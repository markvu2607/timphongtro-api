import { Exclude } from 'class-transformer';
import { Post } from 'src/api/posts/entities/post.entity';
import { Province } from 'src/api/provinces/entities/province.entity';
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

@Entity('districts')
export class District {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @ManyToOne(() => Province, (province) => province.id)
  @JoinColumn({ name: 'province_id' })
  province: Province;

  @OneToMany(() => Post, (post) => post.district)
  posts: Post[];

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
