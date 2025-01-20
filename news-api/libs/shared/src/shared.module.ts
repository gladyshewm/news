import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Publisher } from './entities/publisher.entity';
import { NewsClick } from './entities/news-clicks.entity';
import { AuthorStat } from './entities/author-stats.entity';
import { TrendingTopic } from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([TrendingTopic, Publisher, NewsClick, AuthorStat]),
  ],
  exports: [TypeOrmModule],
})
export class SharedModule {}
