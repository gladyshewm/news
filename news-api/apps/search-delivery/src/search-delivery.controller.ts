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
}
