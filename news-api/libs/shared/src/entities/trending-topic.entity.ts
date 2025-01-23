import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Publisher } from './publisher.entity';
import { NewsClick } from './news-clicks.entity';

@Unique(['title', 'url', 'date'])
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

  @ManyToOne(() => Publisher, (publisher) => publisher.id, { cascade: true })
  @JoinColumn()
  publisher: Publisher;

  @Column()
  date: Date;

  @OneToMany(() => NewsClick, (newsClick) => newsClick.trendingTopic, {
    cascade: true,
  })
  newsClicks: NewsClick[];
}
