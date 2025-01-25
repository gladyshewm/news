import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { SearchDeliveryService } from './search-delivery.service';
import { AuthorStatsDto, FrequentlyReadNewsDto } from '@app/shared';
import { Request } from 'express';
import { TrendingTopicsQueryDto } from './dto/trending-topics-query.dto';
import { LatestNewsQueryDto } from './dto/latest-news-query.dto';

@Controller('search-delivery')
export class SearchDeliveryController {
  constructor(private readonly searchDeliveryService: SearchDeliveryService) {}

  @Get('trending-topics')
  async trendingTopics(@Query() query: TrendingTopicsQueryDto) {
    return this.searchDeliveryService.trendingTopics(query);
  }

  @Get('latest-news')
  async latestNews(@Query() query: LatestNewsQueryDto) {
    return this.searchDeliveryService.latestNews(query);
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
    @Body('trendingTopicId') trendingTopicId: number,
    @Req() req: Request,
  ): Promise<void> {
    return this.searchDeliveryService.registerClick({
      trendingTopicId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
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
