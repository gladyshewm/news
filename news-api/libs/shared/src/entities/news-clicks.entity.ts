import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TrendingTopic } from './trending-topic.entity';

@Entity()
export class NewsClick {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => TrendingTopic, (trendingTopic) => trendingTopic.newsClicks)
  trendingTopic: TrendingTopic;

  @Column()
  trendingTopicId: number;

  @Column()
  ipAddress: string;

  @Column()
  userAgent: string;

  @Column()
  clickedAt: Date;
}
