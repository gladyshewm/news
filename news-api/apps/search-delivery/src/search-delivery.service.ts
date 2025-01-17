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
import { SupportedTopicsDto } from './dto/supported-topics.dto';
import { DataFetcherResponseDto } from './dto/data-fetcher-response.dto';

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
    topic: SupportedTopicsDto,
    page: number,
    limit: number,
    sort: string,
    country?: string,
  ) =>
    `trendingTopics:${language}-${topic}-${page}-${limit}-${sort}${country ? `-${country}` : ''}`;

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

  async trendingTopics(
    language: string,
    topic: SupportedTopicsDto,
    page: number,
    limit: number,
    sort: string,
    country?: string,
  ): Promise<TrendingTopicsDBResponseDto> {
    const cacheKey = this.getCacheKeyTrendingTopics(
      language,
      topic,
      page,
      limit,
      sort,
      country,
    );

    // const cachedResponse = await this.getTrendingTopicsFromCache(cacheKey);
    // if (cachedResponse) return cachedResponse;

    try {
      const whereCondition: any = { language, topicId: topic };
      if (country) whereCondition.country = country;
      const [topics, count] = await this.trendingTopicRepo.findAndCount({
        where: whereCondition,
        // order: { [sort]: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
        relations: ['publisher'],
      });

      if (count === 0) {
        await lastValueFrom(
          this.dataFetcherClient.send('trending_topics', {
            language,
            topic,
            ...(country && { country }),
          }),
        );

        const [newTopics, newCount] = await this.trendingTopicRepo.findAndCount(
          {
            where: whereCondition,
            order: { [sort]: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
            relations: ['publisher'],
          },
        );

        const result = {
          data: newTopics,
          total: newCount,
          page,
          pages: Math.ceil(newCount / limit),
        };

        await this.cacheManager.set(cacheKey, result, 1000 * 60 * 15);

        return result;
      }

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

  private getCacheKeyLatestNews = (language: string, limit: number) =>
    `latestNews:${language}-${limit}`;

  async latestNews(
    language: string,
    limit: number,
  ): Promise<TrendingTopicsDBResponseDto> {
    const cacheKey = this.getCacheKeyLatestNews(language, limit);
    // const cachedResponse = await this.getTrendingTopicsFromCache(cacheKey);
    // if (cachedResponse) return cachedResponse;

    try {
      const [latestNews, total] = await this.trendingTopicRepo.findAndCount({
        where: { language },
        order: { date: 'DESC' },
        skip: 0,
        take: limit,
        relations: ['publisher'],
      });

      const result = {
        data: latestNews,
        total,
        page: 1,
        pages: Math.ceil(total / limit),
      };

      await this.cacheManager.set(cacheKey, result, 1000 * 60 * 15);

      return result;
    } catch (error) {
      this.logger.error(`Failed to fetch latest news: ${error.message}`);
      throw new Error(`Failed to fetch latest news: ${error.message}`);
    }
  }

  // TODO: обращаться сначала к репо перед data fetcher
  async searchArticles(
    query: string,
    language: string,
  ): Promise<SearchArticlesDto[]> {
    try {
      const articles = await lastValueFrom(
        this.dataFetcherClient.send<
          DataFetcherResponseDto<SearchArticlesDto[]>
        >('search_articles', {
          query,
          language,
        }),
      );

      if (articles.success === false) {
        this.logger.error(`Failed to fetch search articles: ${articles.error}`);
        return [];
      }

      return articles.data;
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
        this.dataFetcherClient.send<
          DataFetcherResponseDto<SearchPublishersDto[]>
        >('search_publishers', {
          query,
          country,
          language,
          category,
        }),
      );

      if (publishers.success === false) {
        this.logger.error(
          `Failed to fetch search publishers: ${publishers.error}`,
        );
        return [];
      }

      return publishers.data;
    } catch (error) {
      this.logger.error(`Failed to fetch search publishers: ${error.message}`);
      throw new Error(`Failed to fetch search publishers: ${error.message}`);
    }
  }
}
