import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
  TrendingTopicDto,
  TrendingTopicsResponseDto,
} from '../data-fetcher/dto/trending-topic.dto';

@Injectable()
export class NewsApiService {
  private readonly logger = new Logger(NewsApiService.name);

  constructor(private readonly httpService: HttpService) {}

  async getTrendingTopics(
    topic: string,
    language: string,
  ): Promise<TrendingTopicDto[]> {
    try {
      const response =
        await this.httpService.axiosRef.get<TrendingTopicsResponseDto>(
          '/trendings',
          {
            params: {
              topic,
              language,
            },
          },
        );

      return response.data.data;
    } catch (error) {
      this.logger.error(`Failed to fetch trending topics: ${error.message}`);
      throw new HttpException(
        `Failed to fetch trending topics: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
