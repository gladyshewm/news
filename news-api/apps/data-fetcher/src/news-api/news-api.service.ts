import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';

import { SearchArticlesPayload } from '../dto/search-articles-payload.dto';
import { RmqContext } from '@nestjs/microservices';
import { RmqService } from '@app/rmq';
import {
  SearchArticlesDto,
  SearchArticlesResponseDto,
  SearchPublishersDto,
  SupportedTopicsDto,
  TrendingTopicDto,
} from '@app/shared';
import { TrendingTopicsResponseDto } from '../dto/trending-topics-res.dto';
import { TrendingTopicsPayload } from '../dto/trending-topics-payload.dto';
import { SearchPublishersPayload } from '../dto/search-publishers-payload.dto';
import { SearchPublishersResponseDto } from '../dto/search-publishers-res.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataFetcherService } from '../data-fetcher/data-fetcher.service';

@Injectable()
export class NewsApiService {
  private readonly logger = new Logger(NewsApiService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly rmqService: RmqService,
    private readonly dataFetcherService: DataFetcherService,
  ) {}

  @Cron(CronExpression.EVERY_3_HOURS)
  async fetchTrendingTopics(): Promise<void> {
    this.logger.log('Starting scheduled trending topics fetch...');

    try {
      const topicsList: SupportedTopicsDto[] = [
        'Business',
        'Entertainment',
        'General',
        'Health',
        'Lifestyle',
        'Politics',
        'Science',
        'Sports',
        'Technology',
        'World',
      ];

      for (const topic of topicsList) {
        const topics = await this.getTrendingTopics(topic, 'en');
        await this.dataFetcherService.saveTopics(topics);
      }

      this.logger.log('Trending topics successfully fetched and saved.');
    } catch (error) {
      this.logger.error(`Error fetching trending topics: ${error.message}`);
    }
  }

  async getTrendingTopics(
    topic: SupportedTopicsDto,
    language: string,
    country?: string,
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
            country: country ?? undefined,
          },
        },
      );
      topics.forEach((t) => {
        t.topicId = topic;
        t.country = country ?? '';
      });

      return topics;
    } catch (error) {
      this.logger.error(`Failed to fetch trending topics: ${error.message}`);
      throw new HttpException(
        `Failed to fetch trending topics: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async trendingTopics(
    payload: TrendingTopicsPayload,
    context: RmqContext,
  ): Promise<TrendingTopicDto[]> {
    const { topic, language, country } = payload;
    try {
      const topics = await this.getTrendingTopics(topic, language, country);
      return topics;
    } catch (error) {
      this.logger.error(`Failed to fetch trending topics: ${error.message}`);
      throw new HttpException(
        `Failed to fetch trending topics: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    } finally {
      this.rmqService.ack(context);
    }
  }

  async searchArticles(
    payload: SearchArticlesPayload,
    context: RmqContext,
  ): Promise<SearchArticlesDto[]> {
    const { query, language } = payload;
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
    const { query, country, language, category } = payload;

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
