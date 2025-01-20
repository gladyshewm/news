import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AuthorStat } from './author-stats.entity';

@Entity()
export class Publisher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  url: string;

  @Column()
  favicon: string;

  @OneToMany(() => AuthorStat, (authorStat) => authorStat.publisher, {
    cascade: true,
  })
  authorStats: AuthorStat[];
}
