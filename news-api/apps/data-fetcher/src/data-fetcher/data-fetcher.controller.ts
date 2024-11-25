import { Controller, Get, Query } from '@nestjs/common';
import { DataFetcherService } from './data-fetcher.service';
import { NewsApiService } from '../news-api/news-api.service';

@Controller('data-fetcher')
export class DataFetcherController {
  constructor(
    private readonly dataFetcherService: DataFetcherService,
    private readonly newsApiService: NewsApiService,
  ) {}

  @Get('trending-topics')
  async getTrendingTopics(
    @Query('topic') topic: string,
    @Query('language') language: string,
  ) {
    return this.newsApiService.getTrendingTopics(
      topic || 'General',
      language || 'en',
    );
  }
}
