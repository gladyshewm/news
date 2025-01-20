import { Injectable, Logger } from '@nestjs/common';
import { TrendingTopicRepository } from './trending-topic.repository';
import { TrendingTopicDto } from '@app/shared';

@Injectable()
export class DataFetcherService {
  private readonly logger = new Logger(DataFetcherService.name);

  constructor(private readonly trendingTopicRepo: TrendingTopicRepository) {}

  async saveTopics(topics: TrendingTopicDto[]): Promise<void> {
    try {
      await this.trendingTopicRepo.save(topics);
    } catch (error) {
      this.logger.error(`Failed to save topics: ${error.message}`);
      throw new Error(`Failed to save topics: ${error.message}`);
    }
  }
}
