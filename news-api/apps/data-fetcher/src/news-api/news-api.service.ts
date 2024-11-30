import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
  TrendingTopicDto,
  TrendingTopicsResponseDto,
} from '../data-fetcher/dto/trending-topic.dto';
import {
  SearchPublishersDto,
  SearchPublishersResponseDto,
} from '../data-fetcher/dto/search-publishers.dto';
import {
  SearchArticlesDto,
  SearchArticlesResponseDto,
} from '../data-fetcher/dto/search-articles.dto';

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

  async searchArticles(
    query: string,
    language: string,
  ): Promise<SearchArticlesDto[]> {
    try {
      const response =
        await this.httpService.axiosRef.get<SearchArticlesResponseDto>(
          '/search/articles',
          {
            params: {
              query,
              language,
            },
          },
        );

      return response.data.data;
    } catch (error) {
      this.logger.error(`Failed to fetch search articles: ${error.message}`);
      throw new HttpException(
        `Failed to fetch search articles: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async searchPublishers(
    query: string,
    country: string,
    language: string,
    category: string,
  ): Promise<SearchPublishersDto[]> {
    try {
      const response =
        await this.httpService.axiosRef.get<SearchPublishersResponseDto>(
          '/search/publishers',
          {
            params: {
              query,
              country,
              language,
              category,
            },
          },
        );

      return response.data.data;
    } catch (error) {
      this.logger.error(`Failed to fetch search publishers: ${error.message}`);
      throw new HttpException(
        `Failed to fetch search publishers: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
