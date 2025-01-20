import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Publisher } from './publisher.entity';
import { NewsClick } from './news-clicks.entity';

@Entity()
export class TrendingTopic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  topicId: string;

  @Column()
  title: string;

  @Column()
  url: string;

  @Column()
  excerpt: string;

  @Column()
  thumbnail: string;

  @Column()
  language: string;

  @Column({ nullable: true })
  country: string;

  @Column()
  contentLength: number;

  @Column('text', { array: true, default: [] })
  authors: string[];

  @Column('text', { array: true, default: [] })
  keywords: string[];

  @OneToOne(() => Publisher, (publisher) => publisher.id, { cascade: true })
  @JoinColumn()
  publisher: Publisher;

  @Column()
  date: Date;

  @OneToMany(() => NewsClick, (newsClick) => newsClick.trendingTopic, {
    cascade: true,
  })
  newsClicks: NewsClick[];
}
