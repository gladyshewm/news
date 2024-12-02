import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TrendingTopic } from './entities/trending-topic.entity';
import { Repository } from 'typeorm';
import { TrendingTopicsDBResponseDto } from './dto/trending-topics-db-res.dto';
import { DATA_FETCHER_SERVICE } from './constants/services';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { SearchArticlesDto } from './dto/search-articles.dto';
import { SearchPublishersDto } from './dto/search-publishers.dto';

@Injectable()
export class SearchDeliveryService {
  private readonly logger = new Logger(SearchDeliveryService.name);

  constructor(
    @InjectRepository(TrendingTopic)
    private readonly trendingTopicRepo: Repository<TrendingTopic>,
    @Inject(DATA_FETCHER_SERVICE)
    private readonly dataFetcherClient: ClientProxy,
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

  async searchArticles(
    query: string,
    language: string,
  ): Promise<SearchArticlesDto[]> {
    try {
      const articles = await lastValueFrom(
        this.dataFetcherClient.send<SearchArticlesDto[]>('search_articles', {
          query,
          language,
        }),
      );

      return articles;
    } catch (error) {
      this.logger.error(`Failed to fetch search articles: ${error.message}`);
      throw new Error(`Failed to fetch search articles: ${error.message}`);
    }
  }

  async searchPublishers(
    query: string,
    country: string,
    language: string,
    category: string,
  ): Promise<SearchPublishersDto[]> {
    try {
      const publishers = await lastValueFrom(
        this.dataFetcherClient.send<SearchPublishersDto[]>(
          'search_publishers',
          {
            query,
            country,
            language,
            category,
          },
        ),
      );

      return publishers;
    } catch (error) {
      this.logger.error(`Failed to fetch search publishers: ${error.message}`);
      throw new Error(`Failed to fetch search publishers: ${error.message}`);
    }
  }
}
