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
} from '../data-fetcher/dto/trending-topic.dto';
import {
  SearchPublishersDto,
  SearchPublishersResponseDto,
} from '../data-fetcher/dto/search-publishers.dto';
import {
  SearchArticlesDto,
  SearchArticlesResponseDto,
} from '../data-fetcher/dto/search-articles.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class NewsApiService {
  private readonly logger = new Logger(NewsApiService.name);

  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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
    query: string,
    language: string,
  ): Promise<SearchArticlesDto[]> {
    try {
      const cachedArticles = await this.cacheManager.get<SearchArticlesDto[]>(
        query + language,
      );

      if (cachedArticles) {
        return cachedArticles;
      }

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

      await this.cacheManager.set(query, articles, 1000 * 60 * 15);

      return articles;
    } catch (error) {
      this.logger.error(`Failed to fetch search articles: ${error.message}`);
      throw new HttpException(
        `Failed to fetch search articles: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async searchPublishers(
    query: string,
    country: string,
    language: string,
    category: string,
  ): Promise<SearchPublishersDto[]> {
    try {
      const cachedPublishers = await this.cacheManager.get<
        SearchPublishersDto[]
      >(query + country + language + category);

      if (cachedPublishers) {
        return cachedPublishers;
      }

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

      await this.cacheManager.set(query, publishers, 1000 * 60 * 15);

      return publishers;
    } catch (error) {
      this.logger.error(`Failed to fetch search publishers: ${error.message}`);
      throw new HttpException(
        `Failed to fetch search publishers: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
