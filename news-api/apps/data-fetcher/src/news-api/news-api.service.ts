import { HttpService } from '@nestjs/axios';
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import {
  TrendingTopicDto,
  TrendingTopicsResponseDto,
} from '../dto/trending-topic.dto';
import {
  SearchPublishersDto,
  SearchPublishersPayload,
  SearchPublishersResponseDto,
} from '../dto/search-publishers.dto';
import {
  SearchArticlesDto,
  SearchArticlesPayload,
  SearchArticlesResponseDto,
} from '../dto/search-articles.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { RmqContext } from '@nestjs/microservices';
import { RmqService } from '@app/rmq';
import { SupportedTopicsDto } from '../dto/supported-topics.dto';

@Injectable()
export class NewsApiService {
  private readonly logger = new Logger(NewsApiService.name);

  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly rmqService: RmqService,
  ) {}

  async getTrendingTopics(
    topic: SupportedTopicsDto,
    language: string,
  ): Promise<TrendingTopicDto[]> {
    try {
      const {
        data: { data: topics },
      } = await this.httpService.axiosRef.get<TrendingTopicsResponseDto>(
        '/trendings',
        {
          params: {
            topic,
            language,
          },
        },
      );
      topics.forEach((t) => (t.topicId = topic));

      return topics;
    } catch (error) {
      this.logger.error(`Failed to fetch trending topics: ${error.message}`);
      throw new HttpException(
        `Failed to fetch trending topics: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private getCacheKeySearchArticles = (query: string, language: string) =>
    `searchArticles:${query}-${language}`;

  private async getArticlesFromCache(
    cacheKey: string,
  ): Promise<SearchArticlesDto[] | null> {
    try {
      return (
        (await this.cacheManager.get<SearchArticlesDto[]>(cacheKey)) || null
      );
    } catch (error) {
      this.logger.warn(`Cache error: ${error.message}`);
      return null;
    }
  }

  async searchArticles(
    payload: SearchArticlesPayload,
    context: RmqContext,
  ): Promise<SearchArticlesDto[]> {
    const { query, language } = payload;
    const cacheKey = this.getCacheKeySearchArticles(query, language);

    const cachedArticles = await this.getArticlesFromCache(cacheKey);
    if (cachedArticles) return cachedArticles;

    try {
      const {
        data: { data: articles },
      } = await this.httpService.axiosRef.get<SearchArticlesResponseDto>(
        '/search/articles',
        {
          params: {
            query,
            language,
          },
        },
      );

      await this.cacheManager.set(cacheKey, articles, 1000 * 60 * 15);

      return articles;
    } catch (error) {
      this.logger.error(`Failed to fetch search articles: ${error.message}`);
      throw new HttpException(
        `Failed to fetch search articles: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    } finally {
      this.rmqService.ack(context);
    }
  }

  private getCacheKeySearchPublishers = (
    query: string,
    language: string,
    country: string,
    category: string,
  ) => `searchPublishers:${query}-${country}-${language}-${category}`;

  private async getPublishersFromCache(
    cacheKey: string,
  ): Promise<SearchPublishersDto[] | null> {
    try {
      return (
        (await this.cacheManager.get<SearchPublishersDto[]>(cacheKey)) || null
      );
    } catch (error) {
      this.logger.warn(`Cache error: ${error.message}`);
      return null;
    }
  }

  async searchPublishers(
    payload: SearchPublishersPayload,
    context: RmqContext,
  ): Promise<SearchPublishersDto[]> {
    const { query, country, language, category } = payload;
    const cacheKey = this.getCacheKeySearchPublishers(
      query,
      language,
      country,
      category,
    );

    const cachedPublishers = await this.getPublishersFromCache(cacheKey);
    if (cachedPublishers) return cachedPublishers;

    try {
      const {
        data: { data: publishers },
      } = await this.httpService.axiosRef.get<SearchPublishersResponseDto>(
        '/search/publishers',
        {
          params: {
            query,
            country,
            language,
            category,
          },
        },
      );

      await this.cacheManager.set(cacheKey, publishers, 1000 * 60 * 15);

      return publishers;
    } catch (error) {
      this.logger.error(`Failed to fetch search publishers: ${error.message}`);
      throw new HttpException(
        `Failed to fetch search publishers: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    } finally {
      this.rmqService.ack(context);
    }
  }
}
