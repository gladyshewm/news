import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TrendingTopic } from './entities/trending-topic.entity';
import { Repository } from 'typeorm';
import { TrendingTopicDto } from './dto/trending-topic.dto';

@Injectable()
export class TrendingTopicRepository {
  constructor(
    @InjectRepository(TrendingTopic)
    private readonly repo: Repository<TrendingTopic>,
  ) {}

  async save(topics: TrendingTopicDto[]): Promise<void> {
    const trendingTopics = this.repo.create(topics);
    await this.repo.save(trendingTopics);
  }
}
