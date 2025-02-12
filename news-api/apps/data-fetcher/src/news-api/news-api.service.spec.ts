import { Test, TestingModule } from '@nestjs/testing';
import { NewsApiService } from './news-api.service';
import { RmqService } from '@app/rmq';
import { HttpService } from '@nestjs/axios';
import { RmqContext } from '@nestjs/microservices';
import { SearchArticlesPayload } from '../dto/search-articles-payload.dto';
import { SearchPublishersPayload } from '../dto/search-publishers-payload.dto';
import { DataFetcherService } from '../data-fetcher/data-fetcher.service';
import {
  SearchArticlesDto,
  SearchPublishersDto,
  SupportedTopicsDto,
  TrendingTopicDto,
} from '@app/shared';
import { TrendingTopicsPayload } from '../dto/trending-topics-payload.dto';

jest.mock('../data-fetcher/data-fetcher.service');

describe('NewsApiService', () => {
  let newsApiService: NewsApiService;
  let dataFetcherService: jest.Mocked<DataFetcherService>;
  let rmqService: jest.Mocked<RmqService>;
  let httpService: jest.Mocked<HttpService>;

  const mockRmqService = {
    ack: jest.fn(),
  };
  const mockHttpService = {
    axiosRef: {
      get: jest.fn().mockResolvedValue({ data: { data: [] } }),
    },
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [],
      providers: [
        NewsApiService,
        DataFetcherService,
        {
          provide: RmqService,
          useValue: mockRmqService,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    newsApiService = app.get<NewsApiService>(NewsApiService);
    dataFetcherService =
      app.get<jest.Mocked<DataFetcherService>>(DataFetcherService);
    rmqService = app.get<jest.Mocked<RmqService>>(RmqService);
    httpService = app.get<jest.Mocked<HttpService>>(HttpService);
  });

  describe('root', () => {
    it('should be defined', () => {
      expect(newsApiService).toBeDefined();
    });
  });

  describe('getTrendingTopics', () => {
    let result: TrendingTopicDto[];
    const topics: TrendingTopicDto[] = [];
    const topic = 'General';
    const language = 'en';
    const country = 'us';

    beforeEach(async () => {
      jest
        .spyOn(httpService.axiosRef, 'get')
        .mockResolvedValue({ data: { data: topics } });
      result = await newsApiService.getTrendingTopics(topic, language, country);
    });

    it('should call httpService.axiosRef.get', async () => {
      expect(httpService.axiosRef.get).toHaveBeenCalledWith('/trendings', {
        params: { topic, language, country },
      });
    });

    it('should return a list of trending topics', async () => {
      result.forEach((t) => {
        expect(t.topicId).toBeDefined();
        expect(t.language).toBeDefined();
        expect(t.country).toBeDefined();
      });
    });

    it('should throw an error if httpService.axiosRef.get throws an error', async () => {
      jest.spyOn(httpService.axiosRef, 'get').mockRejectedValue(new Error());
      await expect(
        newsApiService.getTrendingTopics(topic, language, country),
      ).rejects.toThrow(Error);
    });
  });

  describe('fetchTrendingTopics', () => {
    const topicsList: SupportedTopicsDto[] = [
      'Business',
      'Entertainment',
      'General',
      'Health',
      'Lifestyle',
      'Politics',
      'Science',
      'Sports',
      'Technology',
      'World',
    ];

    beforeEach(async () => {
      jest
        .spyOn(httpService.axiosRef, 'get')
        .mockResolvedValue({ data: { data: [] as TrendingTopicDto[] } });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should call dataFetcherService.saveTopics', async () => {
      const spy = jest.spyOn(newsApiService, 'getTrendingTopics');

      await newsApiService.fetchTrendingTopics();

      for (const topic of topicsList) {
        expect(spy).toHaveBeenCalledWith(topic, 'en');
        expect(dataFetcherService.saveTopics).toHaveBeenCalledWith([]);
      }
    });
  });

  describe('trendingTopics', () => {
    let result: TrendingTopicDto[];
    const topics: TrendingTopicDto[] = [];
    const payload: TrendingTopicsPayload = {
      topic: 'General',
      language: 'en',
      country: 'us',
    };
    const ctx = {} as RmqContext;

    beforeEach(async () => {
      jest
        .spyOn(httpService.axiosRef, 'get')
        .mockResolvedValue({ data: { data: topics } });
    });

    it('should call getTrendingTopics', async () => {
      const spy = jest.spyOn(newsApiService, 'getTrendingTopics');
      await newsApiService.trendingTopics(payload, ctx);
      expect(spy).toHaveBeenCalledWith(
        payload.topic,
        payload.language,
        payload.country,
      );
    });

    it('should return a list of trending topics', async () => {
      jest.spyOn(newsApiService, 'getTrendingTopics').mockResolvedValue(topics);
      result = await newsApiService.trendingTopics(payload, ctx);

      expect(result).toEqual(topics);
    });

    it('should throw an error if getTrendingTopics throws an error', async () => {
      jest
        .spyOn(newsApiService, 'getTrendingTopics')
        .mockRejectedValue(new Error());
      await expect(newsApiService.trendingTopics(payload, ctx)).rejects.toThrow(
        Error,
      );
    });

    it('should call rmqService.ack', async () => {
      await newsApiService.trendingTopics(payload, ctx);
      expect(rmqService.ack).toHaveBeenCalledWith(ctx);
    });
  });

  describe('searchArticles', () => {
    let result: SearchArticlesDto[];
    const payload: SearchArticlesPayload = { query: 'query', language: 'en' };
    const ctx = {} as RmqContext;

    beforeEach(async () => {
      jest
        .spyOn(httpService.axiosRef, 'get')
        .mockResolvedValue({ data: { data: [] as SearchArticlesDto[] } });
      result = await newsApiService.searchArticles(payload, ctx);
    });

    it('should call httpService.axiosRef.get', async () => {
      expect(httpService.axiosRef.get).toHaveBeenCalledWith(
        '/search/articles',
        {
          params: { query: payload.query, language: payload.language },
        },
      );
    });

    it('should return a list of search articles', async () => {
      expect(result).toEqual([]);
    });

    it('should throw an error if httpService.axiosRef.get throws an error', async () => {
      jest.spyOn(httpService.axiosRef, 'get').mockRejectedValue(new Error());
      await expect(newsApiService.searchArticles(payload, ctx)).rejects.toThrow(
        Error,
      );
    });

    it('should call rmqService.ack', async () => {
      await newsApiService.searchArticles(payload, ctx);
      expect(rmqService.ack).toHaveBeenCalledWith(ctx);
    });
  });

  describe('searchPublishers', () => {
    let result: SearchPublishersDto[];
    const payload: SearchPublishersPayload = {
      query: 'query',
      country: 'country',
      language: 'en',
      category: 'category',
    };
    const ctx = {} as RmqContext;

    beforeEach(async () => {
      jest
        .spyOn(httpService.axiosRef, 'get')
        .mockResolvedValue({ data: { data: [] as SearchPublishersDto[] } });
      result = await newsApiService.searchPublishers(payload, ctx);
    });

    it('should call httpService.axiosRef.get', async () => {
      expect(httpService.axiosRef.get).toHaveBeenCalledWith(
        '/search/publishers',
        {
          params: {
            query: payload.query,
            country: payload.country,
            language: payload.language,
            category: payload.category,
          },
        },
      );
    });

    it('should return a list of search publishers', async () => {
      expect(result).toEqual([]);
    });

    it('should throw an error if httpService.axiosRef.get throws an error', async () => {
      jest.spyOn(httpService.axiosRef, 'get').mockRejectedValue(new Error());
      await expect(
        newsApiService.searchPublishers(payload, ctx),
      ).rejects.toThrow(Error);
    });

    it('should call rmqService.ack', async () => {
      expect(rmqService.ack).toHaveBeenCalledWith(ctx);
    });
  });
});
