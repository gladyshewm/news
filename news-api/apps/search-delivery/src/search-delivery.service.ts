import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TrendingTopic } from './entities/trending-topic.entity';
import { Repository } from 'typeorm';
import { TrendingTopicsDBResponseDto } from './dto/trending-topics-db-res.dto';

@Injectable()
export class SearchDeliveryService {
  private readonly logger = new Logger(SearchDeliveryService.name);

  constructor(
    @InjectRepository(TrendingTopic)
    private readonly trendingTopicRepo: Repository<TrendingTopic>,
  ) {}

  async getTrendingTopics(
    language: string,
    page: number,
    limit: number,
    sort: string,
  ): Promise<TrendingTopicsDBResponseDto> {
    try {
      const [topics, count] = await this.trendingTopicRepo.findAndCount({
        where: { language },
        order: { [sort]: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
        relations: ['publisher'],
      });

      return {
        data: topics,
        total: count,
        page,
        pages: Math.ceil(count / limit),
      };
    } catch (error) {
      this.logger.error(`Failed to fetch trending topics: ${error.message}`);
      throw new Error(`Failed to fetch trending topics: ${error.message}`);
    }
  }
}
