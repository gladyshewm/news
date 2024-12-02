import { Controller, Get, Query } from '@nestjs/common';
import { SearchDeliveryService } from './search-delivery.service';

@Controller('search-delivery')
export class SearchDeliveryController {
  constructor(private readonly searchDeliveryService: SearchDeliveryService) {}

  @Get('trending-topics')
  async getTrendingTopics(
    @Query('language') language: string = 'ru',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('sort') sort: string = 'date',
  ) {
    return this.searchDeliveryService.getTrendingTopics(
      language,
      page,
      limit,
      sort,
    );
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
}
