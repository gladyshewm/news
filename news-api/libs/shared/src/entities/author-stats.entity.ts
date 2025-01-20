import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Publisher } from './publisher.entity';

@Entity()
export class AuthorStat {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Publisher, (publisher) => publisher.authorStats)
  publisher: Publisher;

  @Column()
  publisherId: number;

  @Column()
  totalArticles: number;

  @Column()
  totalClicks: number;

  @UpdateDateColumn()
  lastUpdated: Date;
}
