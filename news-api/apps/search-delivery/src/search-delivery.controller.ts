import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { SearchDeliveryService } from './search-delivery.service';
import { AuthorStatsDto, FrequentlyReadNewsDto } from '@app/shared';
import { Request } from 'express';
import { TrendingTopicsQueryDto } from './dto/trending-topics-query.dto';
import { LatestNewsQueryDto } from './dto/latest-news-query.dto';
import { SearchPublishersQueryDto } from './dto/search-publishers-query.dto';
import { SearchArticlesQueryDto } from './dto/search-articles-query.dto';

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
  async searchArticles(@Query() query: SearchArticlesQueryDto) {
    return this.searchDeliveryService.searchArticles(query);
  }

  @Get('search/publishers')
  async searchPublishers(@Query() query: SearchPublishersQueryDto) {
    return this.searchDeliveryService.searchPublishers(query);
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
