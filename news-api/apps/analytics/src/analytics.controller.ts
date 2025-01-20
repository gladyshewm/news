import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { CreateNewsClickDto } from './dto/create-news-click.dto';
import { AuthorStatsDto, NewsClickDto } from '@app/shared';
import { FrequentlyReadNewsDto } from './dto/frequently-read-news.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('news-click')
  async registerClick(
    @Body() createNewsClickDto: CreateNewsClickDto,
  ): Promise<NewsClickDto> {
    return this.analyticsService.registerClick(createNewsClickDto);
  }

  @Get('frequently-read')
  async frequentlyReadNews(
    @Query('limit') limit: number = 10,
  ): Promise<FrequentlyReadNewsDto[]> {
    return this.analyticsService.frequentlyReadNews(limit);
  }

  @Get('top-authors')
  async getTopAuthors(
    @Query('limit') limit: number = 10,
  ): Promise<AuthorStatsDto[]> {
    return this.analyticsService.getTopAuthors(limit);
  }
}
