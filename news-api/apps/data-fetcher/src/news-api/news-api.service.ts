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

@Injectable()
export class NewsApiService {
  private readonly logger = new Logger(NewsApiService.name);

  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly rmqService: RmqService,
  ) {}

  async getTrendingTopics(
    topic: string,
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

      return topics;
    } catch (error) {
      this.logger.error(`Failed to fetch trending topics: ${error.message}`);
      throw new HttpException(
        `Failed to fetch trending topics: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async searchArticles(
    payload: SearchArticlesPayload,
    context: RmqContext,
  ): Promise<SearchArticlesDto[]> {
    try {
      const { query, language } = payload;
      const cachedArticles = await this.cacheManager.get<SearchArticlesDto[]>(
        query + language,
      );

      if (cachedArticles) return cachedArticles;

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

      await this.cacheManager.set(query + language, articles, 1000 * 60 * 15);

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

  async searchPublishers(
    payload: SearchPublishersPayload,
    context: RmqContext,
  ): Promise<SearchPublishersDto[]> {
    try {
      const { query, country, language, category } = payload;
      const cachedPublishers = await this.cacheManager.get<
        SearchPublishersDto[]
      >(query + country + language + category);

      if (cachedPublishers) return cachedPublishers;

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

      await this.cacheManager.set(
        query + country + language + category,
        publishers,
        1000 * 60 * 15,
      );

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
