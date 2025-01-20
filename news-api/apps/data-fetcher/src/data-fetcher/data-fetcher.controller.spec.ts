import { Test, TestingModule } from '@nestjs/testing';
import { DataFetcherController } from './data-fetcher.controller';
import { DataFetcherService } from './data-fetcher.service';
import { NewsApiService } from '../news-api/news-api.service';
import {
  TrendingTopicDto,
  TrendingTopicsPayload,
} from '../dto/trending-topic.dto';
import { RmqContext } from '@nestjs/microservices';
import { DataFetcherResponseDto } from '../dto/data-fetcher-response.dto';
import {
  SearchArticlesDto,
  SearchArticlesPayload,
} from '../dto/search-articles-payload.dto';
import {
  SearchPublishersDto,
  SearchPublishersPayload,
} from '../dto/search-publishers-payload.dto';

jest.mock('./data-fetcher.service');
jest.mock('../news-api/news-api.service');

describe('DataFetcherController', () => {
  let dataFetcherController: DataFetcherController;
  let dataFetcherService: jest.Mocked<DataFetcherService>;
  let newsApiService: jest.Mocked<NewsApiService>;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [DataFetcherController],
      providers: [DataFetcherService, NewsApiService],
    }).compile();

    dataFetcherController = app.get<DataFetcherController>(
      DataFetcherController,
    );
    dataFetcherService =
      app.get<jest.Mocked<DataFetcherService>>(DataFetcherService);
    newsApiService = app.get<jest.Mocked<NewsApiService>>(NewsApiService);
  });

  describe('root', () => {
    it('should be defined', () => {
      expect(dataFetcherController).toBeDefined();
    });
  });

  describe('Endpoints', () => {
    describe('getTrendingTopics', () => {
      let trendingTopics: TrendingTopicDto[];
      const topics: TrendingTopicDto[] = [];
      const topic = 'General';
      const language = 'language';

      beforeEach(async () => {
        newsApiService.getTrendingTopics.mockResolvedValue(topics);
        trendingTopics = await dataFetcherController.getTrendingTopics(
          topic,
          language,
        );
      });

      it('should call newsApiService.getTrendingTopics', () => {
        expect(newsApiService.getTrendingTopics).toHaveBeenCalledWith(
          topic,
          language,
        );
      });

      it('should call dataFetcherService.saveTopics', () => {
        expect(dataFetcherService.saveTopics).toHaveBeenCalledWith(topics);
      });

      it('should return trending topics', () => {
        expect(trendingTopics).toEqual(topics);
      });

      it('should throw an error if newsApiService.getTrendingTopics throws an error', async () => {
        newsApiService.getTrendingTopics.mockRejectedValue(new Error());
        await expect(
          dataFetcherController.getTrendingTopics(topic, language),
        ).rejects.toThrow(Error);
      });
    });
  });

  describe('Events', () => {
    describe('trendingTopics', () => {
      let result: DataFetcherResponseDto<TrendingTopicDto[]>;
      const topics: TrendingTopicDto[] = [];
      const payload: TrendingTopicsPayload = {
        topic: 'General',
        language: 'en',
      };
      const ctx = {} as RmqContext;

      beforeEach(async () => {
        newsApiService.trendingTopics.mockResolvedValue(topics);
        result = await dataFetcherController.trendingTopics(payload, ctx);
      });

      it('should call newsApiService.trendingTopics', () => {
        expect(newsApiService.trendingTopics).toHaveBeenCalledWith(
          payload,
          ctx,
        );
      });

      it('should call dataFetcherService.saveTopics', () => {
        expect(dataFetcherService.saveTopics).toHaveBeenCalledWith(topics);
      });

      it('should return status and data', () => {
        expect(result).toEqual({
          success: true,
          data: topics,
        });
      });

      it('should return status and error message if newsApiService.trendingTopics throws an error', async () => {
        newsApiService.trendingTopics.mockRejectedValue(new Error());
        result = await dataFetcherController.trendingTopics(payload, ctx);

        expect(result).toEqual({
          success: false,
          data: null,
          error: new Error().message,
        });
      });
    });

    describe('searchArticles', () => {
      let result: DataFetcherResponseDto<SearchArticlesDto[]>;
      const articles: SearchArticlesDto[] = [];
      const payload: SearchArticlesPayload = { query: 'query', language: 'en' };
      const ctx = {} as RmqContext;

      beforeEach(async () => {
        newsApiService.searchArticles.mockResolvedValue(articles);
        result = await dataFetcherController.searchArticles(payload, ctx);
      });

      it('should call newsApiService.searchArticles', () => {
        expect(newsApiService.searchArticles).toHaveBeenCalledWith(
          payload,
          ctx,
        );
      });

      it('should return status and data', () => {
        expect(result).toEqual({
          success: true,
          data: articles,
        });
      });

      it('should return status and error message if newsApiService.searchArticles throws an error', async () => {
        newsApiService.searchArticles.mockRejectedValue(new Error());
        result = await dataFetcherController.searchArticles(payload, ctx);

        expect(result).toEqual({
          success: false,
          data: null,
          error: new Error().message,
        });
      });
    });

    describe('searchPublishers', () => {
      let result: DataFetcherResponseDto<SearchPublishersDto[]>;
      const publishers: SearchPublishersDto[] = [];
      const payload: SearchPublishersPayload = {
        query: 'query',
        country: 'country',
        language: 'en',
        category: 'category',
      };
      const ctx = {} as RmqContext;

      beforeEach(async () => {
        newsApiService.searchPublishers.mockResolvedValue(publishers);
        result = await dataFetcherController.searchPublishers(payload, ctx);
      });

      it('should call newsApiService.searchPublishers', () => {
        expect(newsApiService.searchPublishers).toHaveBeenCalledWith(
          payload,
          ctx,
        );
      });

      it('should return status and data', () => {
        expect(result).toEqual({
          success: true,
          data: publishers,
        });
      });

      it('should return status and error message if newsApiService.searchPublishers throws an error', async () => {
        newsApiService.searchPublishers.mockRejectedValue(new Error());
        result = await dataFetcherController.searchPublishers(payload, ctx);

        expect(result).toEqual({
          success: false,
          data: null,
          error: new Error().message,
        });
      });
    });
  });
});
