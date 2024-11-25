import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';

@Injectable()
export class NewsApiService {
  constructor(private readonly httpService: HttpService) {}

  async getTrendingTopics(
    topic: string,
    language: string,
  ): Promise<AxiosResponse<any>> {
    try {
      const response = await this.httpService.axiosRef.get('/trendings', {
        params: {
          topic,
          language,
        },
      });
      return response.data;
    } catch (error) {
      throw new HttpException(
        `Failed to fetch trending topics: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
