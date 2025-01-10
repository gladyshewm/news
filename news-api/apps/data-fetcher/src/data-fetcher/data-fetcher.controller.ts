import { Controller, Get, Query } from '@nestjs/common';
import { DataFetcherService } from './data-fetcher.service';
import { NewsApiService } from '../news-api/news-api.service';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { SearchPublishersPayload } from '../dto/search-publishers.dto';
import { SearchArticlesPayload } from '../dto/search-articles.dto';
import { SupportedTopicsDto } from '../dto/supported-topics.dto';

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

  @MessagePattern('search_articles')
  async searchArticles(
    @Payload() payload: SearchArticlesPayload,
    @Ctx() context: RmqContext,
  ) {
    return this.newsApiService.searchArticles(payload, context);
  }

  @MessagePattern('search_publishers')
  async searchPublishers(
    @Payload() payload: SearchPublishersPayload,
    @Ctx() context: RmqContext,
  ) {
    return this.newsApiService.searchPublishers(payload, context);
  }
}
