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

  @ManyToOne(() => Province, (province) => province.id)
  @JoinColumn({ name: 'province_id' })
  province: Province;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
