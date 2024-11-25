import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TrendingTopic {
  @PrimaryGeneratedColumn()
  id: number;

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

  @Column()
  contentLength: number;

  @Column()
  date: Date;
}
