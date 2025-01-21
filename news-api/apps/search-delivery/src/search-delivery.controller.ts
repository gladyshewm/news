import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { SearchDeliveryService } from './search-delivery.service';
import {
  AuthorStatsDto,
  CreateNewsClickDto,
  FrequentlyReadNewsDto,
  SupportedTopicsDto,
} from '@app/shared';

// TODO: добавить CRON-задачи

@Controller('search-delivery')
export class SearchDeliveryController {
  constructor(private readonly searchDeliveryService: SearchDeliveryService) {}

  @Get('trending-topics')
  async trendingTopics(
    @Query('language') language: string = 'ru',
    @Query('topic') topic: SupportedTopicsDto = 'General',
    @Query('country') country: string = '',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('sort') sort: string = 'date',
  ) {
    return this.searchDeliveryService.trendingTopics(
      language,
      topic,
      page,
      limit,
      sort,
      country,
    );
  }

  @Get('latest-news')
  async latestNews(
    @Query('language') language: string = 'ru',
    @Query('limit') limit: number = 10,
    @Query('topic') topic: SupportedTopicsDto | '' = '',
  ) {
    return this.searchDeliveryService.latestNews(language, limit, topic);
  }

  @Get('search/articles')
  async searchArticles(
    @Query('query') query: string,
    @Query('language') language: string = 'ru',
  ) {
    return this.searchDeliveryService.searchArticles(query, language);
  }

  @Get('search/publishers')
  async searchPublishers(
    @Query('query') query: string,
    @Query('country') country: string = '',
    @Query('language') language: string = '',
    @Query('category') category: string = '',
  ) {
    return this.searchDeliveryService.searchPublishers(
      query,
      country,
      language,
      category,
    );
  }

  @Post('analytics/news-click')
  async registerClick(
    @Body() createNewsClickDto: CreateNewsClickDto,
  ): Promise<void> {
    return this.searchDeliveryService.registerClick(createNewsClickDto);
  }

  @Get('analytics/frequently-read-news')
  async frequentlyReadNews(
    @Query('limit') limit: number = 10,
  ): Promise<FrequentlyReadNewsDto[]> {
    return this.searchDeliveryService.frequentlyReadNews(limit);
  }

  @Get('analytics/top-authors')
  async topAuthors(
    @Query('limit') limit: number = 10,
  ): Promise<AuthorStatsDto[]> {
    return this.searchDeliveryService.topAuthors(limit);
  }
}
