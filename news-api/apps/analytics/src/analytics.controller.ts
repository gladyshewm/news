import { Controller } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import {
  AuthorStatsDto,
  CreateNewsClickDto,
  FrequentlyReadNewsDto,
  ServiceResponseDto,
} from '@app/shared';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { FrequentlyReadNewsPayload } from './dto/frequently-read-news-payload.dto';
import { TopAuthorsPayload } from './dto/top-authors-payload.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @EventPattern('news_click')
  async handleNewsClick(
    @Payload() payload: CreateNewsClickDto,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    await this.analyticsService.registerClick(payload, context);
  }

  @MessagePattern('frequently_read_news')
  async frequentlyReadNews(
    @Payload() payload: FrequentlyReadNewsPayload,
    @Ctx() context: RmqContext,
  ): Promise<ServiceResponseDto<FrequentlyReadNewsDto[]>> {
    try {
      const news = await this.analyticsService.frequentlyReadNews(
        payload,
        context,
      );

      return { success: true, data: news };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  }

  @MessagePattern('top_authors')
  async topAuthors(
    @Payload() payload: TopAuthorsPayload,
    @Ctx() context: RmqContext,
  ): Promise<ServiceResponseDto<AuthorStatsDto[]>> {
    try {
      const authors = await this.analyticsService.topAuthors(payload, context);

      return { success: true, data: authors };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  }
}
