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
    @Query('topic') topic: string = 'General',
    @Query('language') language: string = 'ru',
  ) {
    const topics = await this.newsApiService.getTrendingTopics(topic, language);
    await this.dataFetcherService.saveTopics(topics);

    return topics;
  }

  @Get('search/articles')
  async searchArticles(
    @Query('query') query: string,
    @Query('language') language: string = 'ru',
  ) {
    return this.newsApiService.searchArticles(query, language);
  }

  @Get('search/publishers')
  async searchPublishers(
    @Query('query') query: string,
    @Query('country') country: string = '',
    @Query('language') language: string = '',
    @Query('category') category: string = '',
  ) {
    return this.newsApiService.searchPublishers(
      query,
      country,
      language,
      category,
    );
  }
}
