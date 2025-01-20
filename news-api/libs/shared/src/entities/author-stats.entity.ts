import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
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

  @Column()
  lastUpdated: Date;
}
