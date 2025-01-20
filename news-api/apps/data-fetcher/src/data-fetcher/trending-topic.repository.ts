import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrendingTopic, TrendingTopicDto } from '@app/shared';

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
