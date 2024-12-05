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
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class SearchDeliveryService {
  private readonly logger = new Logger(SearchDeliveryService.name);

  constructor(
    @InjectRepository(TrendingTopic)
    private readonly trendingTopicRepo: Repository<TrendingTopic>,
    @Inject(DATA_FETCHER_SERVICE)
    private readonly dataFetcherClient: ClientProxy,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private getCacheKeyTrendingTopics = (
    language: string,
    page: number,
    limit: number,
    sort: string,
  ) => `trendingTopics:${language}-${page}-${limit}-${sort}`;

  private async getTrendingTopicsFromCache(
    cacheKey: string,
  ): Promise<TrendingTopicsDBResponseDto | null> {
    try {
      return (
        (await this.cacheManager.get<TrendingTopicsDBResponseDto>(cacheKey)) ||
        null
      );
    } catch (error) {
      this.logger.warn(`Cache error: ${error.message}`);
      return null;
    }
  }

  async getTrendingTopics(
    language: string,
    page: number,
    limit: number,
    sort: string,
  ): Promise<TrendingTopicsDBResponseDto> {
    const cacheKey = this.getCacheKeyTrendingTopics(
      language,
      page,
      limit,
      sort,
    );

    // const cachedResponse = await this.getTrendingTopicsFromCache(cacheKey);
    // if (cachedResponse) return cachedResponse;

    try {
      const [topics, count] = await this.trendingTopicRepo.findAndCount({
        where: { language },
        order: { [sort]: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
        relations: ['publisher'],
      });

      const result = {
        data: topics,
        total: count,
        page,
        pages: Math.ceil(count / limit),
      };

      await this.cacheManager.set(cacheKey, result, 1000 * 60 * 15);

      return result;
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
