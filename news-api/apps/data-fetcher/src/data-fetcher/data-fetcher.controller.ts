import { Controller, Get, Query } from '@nestjs/common';
import { DataFetcherService } from './data-fetcher.service';
import { NewsApiService } from '../news-api/news-api.service';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import {
  SearchPublishersDto,
  SearchPublishersPayload,
} from '../dto/search-publishers.dto';
import {
  SearchArticlesDto,
  SearchArticlesPayload,
} from '../dto/search-articles.dto';
import { SupportedTopicsDto } from '../dto/supported-topics.dto';
import {
  TrendingTopicDto,
  TrendingTopicsPayload,
} from '../dto/trending-topic.dto';
import { DataFetcherResponseDto } from '../dto/data-fetcher-response.dto';

@Controller('data-fetcher')
export class DataFetcherController {
  constructor(
    private readonly dataFetcherService: DataFetcherService,
    private readonly newsApiService: NewsApiService,
  ) {}

  @Get('trending-topics')
  async getTrendingTopics(
    @Query('topic') topic: SupportedTopicsDto = 'General',
    @Query('language') language: string = 'ru',
  ) {
    const topics = await this.newsApiService.getTrendingTopics(topic, language);
    await this.dataFetcherService.saveTopics(topics);

    return topics;
  }

  @MessagePattern('trending_topics')
  async trendingTopics(
    @Payload() payload: TrendingTopicsPayload,
    @Ctx() context: RmqContext,
  ): Promise<DataFetcherResponseDto<TrendingTopicDto[]>> {
    try {
      const topics = await this.newsApiService.trendingTopics(payload, context);
      await this.dataFetcherService.saveTopics(topics);

      return { success: true, data: topics };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  }

  @MessagePattern('search_articles')
  async searchArticles(
    @Payload() payload: SearchArticlesPayload,
    @Ctx() context: RmqContext,
  ): Promise<DataFetcherResponseDto<SearchArticlesDto[]>> {
    try {
      const articles = await this.newsApiService.searchArticles(
        payload,
        context,
      );

      return { success: true, data: articles };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  }

  @MessagePattern('search_publishers')
  async searchPublishers(
    @Payload() payload: SearchPublishersPayload,
    @Ctx() context: RmqContext,
  ): Promise<DataFetcherResponseDto<SearchPublishersDto[]>> {
    try {
      const publishers = await this.newsApiService.searchPublishers(
        payload,
        context,
      );

      return { success: true, data: publishers };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  }
}
