import { Test, TestingModule } from '@nestjs/testing';
import { NewsApiService } from './news-api.service';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RmqService } from '@app/rmq';
import { HttpService } from '@nestjs/axios';
import {
  TrendingTopicDto,
  TrendingTopicsPayload,
} from '../dto/trending-topic.dto';
import { RmqContext } from '@nestjs/microservices';
import {
  SearchArticlesDto,
  SearchArticlesPayload,
} from '../dto/search-articles.dto';
import {
  SearchPublishersDto,
  SearchPublishersPayload,
} from '../dto/search-publishers.dto';

describe('NewsApiService', () => {
  let newsApiService: NewsApiService;
  let cacheManager: jest.Mocked<Cache>;
  let rmqService: jest.Mocked<RmqService>;
  let httpService: jest.Mocked<HttpService>;

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };
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
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
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
    cacheManager = app.get<jest.Mocked<Cache>>(CACHE_MANAGER);
    rmqService = app.get<jest.Mocked<RmqService>>(RmqService);
    httpService = app.get<jest.Mocked<HttpService>>(HttpService);
  });

  describe('root', () => {
    it('should be defined', () => {
      expect(newsApiService).toBeDefined();
    });
  });

  describe('getTrendingTopics', () => {
    let trendingTopics: TrendingTopicDto[];
    const topics = [
      {
        title: 'test_test_test',
        language: 'language',
      },
      {
        title: 'test_test_test',
        language: 'language',
      },
    ] as TrendingTopicDto[];
    const topic = 'General';
    const language = 'language';

    beforeEach(async () => {
      jest
        .spyOn(httpService.axiosRef, 'get')
        .mockResolvedValue({ data: { data: topics } });
      trendingTopics = await newsApiService.getTrendingTopics(topic, language);
    });

    it('should call httpService.axiosRef.get', async () => {
      expect(httpService.axiosRef.get).toHaveBeenCalledWith('/trendings', {
        params: { topic, language },
      });
    });

    it('should return trending topics', async () => {
      trendingTopics.forEach((t) => {
        expect(t).toHaveProperty('topicId', topic);
      });
      expect(trendingTopics).toEqual(topics);
    });

    it('should throw an error if httpService.axiosRef.get throws an error', async () => {
      jest.spyOn(httpService.axiosRef, 'get').mockRejectedValue(new Error());
      await expect(
        newsApiService.getTrendingTopics(topic, language),
      ).rejects.toThrow(Error);
    });
  });

  describe('trendingTopics', () => {
    let trendingTopics: TrendingTopicDto[];
    const topics = [
      {
        title: 'test_test_test',
        language: 'language',
      },
      {
        title: 'test_test_test',
        language: 'language',
      },
    ] as TrendingTopicDto[];
    const payload: TrendingTopicsPayload = {
      topic: 'General',
      language: 'language',
    };
    const context = {} as RmqContext;

    beforeEach(async () => {
      jest
        .spyOn(httpService.axiosRef, 'get')
        .mockResolvedValue({ data: { data: topics } });
      trendingTopics = await newsApiService.trendingTopics(payload, context);
    });

    it('should call getTrendingTopics', async () => {
      const spy = jest.spyOn(newsApiService, 'getTrendingTopics');
      await newsApiService.trendingTopics(payload, context);
      expect(spy).toHaveBeenCalledWith(payload.topic, payload.language);
    });

    it('should return trending topics', async () => {
      trendingTopics.forEach((t) => {
        expect(t).toHaveProperty('topicId', payload.topic);
      });
      expect(trendingTopics).toEqual(topics);
    });

    it('should call rmqService.ack', async () => {
      expect(rmqService.ack).toHaveBeenCalledWith(context);
    });

    it('should throw an error if getTrendingTopics throws an error', async () => {
      jest
        .spyOn(newsApiService, 'getTrendingTopics')
        .mockRejectedValue(new Error());
      await expect(
        newsApiService.trendingTopics(payload, context),
      ).rejects.toThrow(Error);
    });
  });

  describe('searchArticles', () => {
    let searchArticles: SearchArticlesDto[];
    const articles = [] as SearchArticlesDto[];
    const payload: SearchArticlesPayload = { query: 'query', language: 'en' };
    const context = {} as RmqContext;
    let httpServiceSpy: jest.SpyInstance;

    beforeEach(async () => {
      httpServiceSpy = jest
        .spyOn(httpService.axiosRef, 'get')
        .mockResolvedValue({ data: { data: articles } });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should call getCacheKeySearchArticles', async () => {
      const spy = jest.spyOn<any, any>(
        newsApiService,
        'getCacheKeySearchArticles',
      );
      await newsApiService.searchArticles(payload, context);
      expect(spy).toHaveBeenCalledWith(payload.query, payload.language);
    });

    it('should call getArticlesFromCache with cacheKey', async () => {
      const spy = jest.spyOn<any, any>(newsApiService, 'getArticlesFromCache');
      await newsApiService.searchArticles(payload, context);
      expect(spy).toHaveBeenCalledWith(expect.any(String));
    });

    it('should return cached articles if it exists', async () => {
      jest
        .spyOn<any, any>(newsApiService, 'getArticlesFromCache')
        .mockResolvedValue(['cached']);
      searchArticles = await newsApiService.searchArticles(payload, context);
      expect(searchArticles).toEqual(['cached']);
      expect(httpServiceSpy).not.toHaveBeenCalled();
    });

    describe('when cache does not exist', () => {
      beforeEach(async () => {
        jest
          .spyOn<any, any>(newsApiService, 'getArticlesFromCache')
          .mockResolvedValue(null);
        searchArticles = await newsApiService.searchArticles(payload, context);
      });

      it('should call httpService.axiosRef.get', async () => {
        expect(httpServiceSpy).toHaveBeenCalledWith('/search/articles', {
          params: { query: payload.query, language: payload.language },
        });
      });

      it('should call cacheManager.set', async () => {
        expect(cacheManager.set).toHaveBeenCalledWith(
          expect.any(String),
          articles,
          expect.any(Number),
        );
      });

      it('should return articles', async () => {
        expect(searchArticles).toEqual(articles);
      });

      it('should call rmqService.ack', async () => {
        expect(rmqService.ack).toHaveBeenCalledWith(context);
      });

      it('should throw an error if httpService.axiosRef.get throws an error', async () => {
        httpServiceSpy.mockRejectedValue(new Error());
        await expect(
          newsApiService.searchArticles(payload, context),
        ).rejects.toThrow(Error);
      });
    });
  });

  describe('searchPublishers', () => {
    let searchPublishers: SearchPublishersDto[];
    const publishers = [] as SearchPublishersDto[];
    const payload: SearchPublishersPayload = {
      query: 'query',
      country: 'country',
      language: 'en',
      category: 'category',
    };
    const context = {} as RmqContext;
    let httpServiceSpy: jest.SpyInstance;

    beforeEach(async () => {
      httpServiceSpy = jest
        .spyOn(httpService.axiosRef, 'get')
        .mockResolvedValue({ data: { data: publishers } });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should call getCacheKeySearchPublishers', async () => {
      const spy = jest.spyOn<any, any>(
        newsApiService,
        'getCacheKeySearchPublishers',
      );
      await newsApiService.searchPublishers(payload, context);
      expect(spy).toHaveBeenCalledWith(
        payload.query,
        payload.language,
        payload.country,
        payload.category,
      );
    });

    it('should call getPublishersFromCache with cacheKey', async () => {
      const spy = jest.spyOn<any, any>(
        newsApiService,
        'getPublishersFromCache',
      );
      await newsApiService.searchPublishers(payload, context);
      expect(spy).toHaveBeenCalledWith(expect.any(String));
    });

    it('should return cached publishers if it exists', async () => {
      jest
        .spyOn<any, any>(newsApiService, 'getPublishersFromCache')
        .mockResolvedValue(['cached']);
      searchPublishers = await newsApiService.searchPublishers(
        payload,
        context,
      );
      expect(searchPublishers).toEqual(['cached']);
      expect(httpServiceSpy).not.toHaveBeenCalled();
    });

    describe('when cache does not exist', () => {
      beforeEach(async () => {
        jest
          .spyOn<any, any>(newsApiService, 'getPublishersFromCache')
          .mockResolvedValue(null);
        searchPublishers = await newsApiService.searchPublishers(
          payload,
          context,
        );
      });

      it('should call httpService.axiosRef.get', async () => {
        expect(httpServiceSpy).toHaveBeenCalledWith('/search/publishers', {
          params: {
            query: payload.query,
            country: payload.country,
            language: payload.language,
            category: payload.category,
          },
        });
      });

      it('should call cacheManager.set', async () => {
        expect(cacheManager.set).toHaveBeenCalledWith(
          expect.any(String),
          publishers,
          expect.any(Number),
        );
      });

      it('should return publishers', async () => {
        expect(searchPublishers).toEqual(publishers);
      });

      it('should call rmqService.ack', async () => {
        expect(rmqService.ack).toHaveBeenCalledWith(context);
      });

      it('should throw an error if httpService.axiosRef.get throws an error', async () => {
        httpServiceSpy.mockRejectedValue(new Error());
        await expect(
          newsApiService.searchPublishers(payload, context),
        ).rejects.toThrow(Error);
      });
    });
  });
});
