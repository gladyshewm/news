import { Test, TestingModule } from '@nestjs/testing';
import { SearchDeliveryService } from './search-delivery.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  AuthorStatsDto,
  CreateNewsClickDto,
  FrequentlyReadNewsDto,
  Publisher,
  ServiceResponseDto,
  TrendingTopic,
} from '@app/shared';
import {
  ANALYTICS_SERVICE,
  DATA_FETCHER_SERVICE,
} from './constants/services.constant';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ILike, Repository, SelectQueryBuilder } from 'typeorm';
import { Cache } from 'cache-manager';
import { TrendingTopicsDBResponseDto } from './dto/trending-topics-db-res.dto';
import { of } from 'rxjs';
import { TrendingTopicsQueryDto } from './dto/trending-topics-query.dto';
import { CACHE_KEYS } from './constants/cache-keys.constant';
import { LatestNewsQueryDto } from './dto/latest-news-query.dto';
import { PublishersDBResponseDto } from './dto/publishers-db-res.dto';
import { SearchPublishersQueryDto } from './dto/search-publishers-query.dto';

describe('SearchDeliveryService', () => {
  let searchDeliveryService: SearchDeliveryService;
  let trendingTopicRepo: jest.Mocked<Repository<TrendingTopic>>;
  // let dataFetcherClient: jest.Mocked<ClientProxy>;
  let cacheManager: jest.Mocked<Cache>;

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    addGroupBy: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    getRawAndEntities: jest.fn().mockResolvedValue({
      entities: [{ id: 1, title: 'Test Topic' }],
      raw: [{ clicks_count: 10 }],
    }),
  } as unknown as jest.Mocked<SelectQueryBuilder<TrendingTopic>>;

  const mockTrendingTopicRepo = {
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    findAndCount: jest.fn().mockReturnValue([[], 0]),
  };

  const mockPublisherRepo = {
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    findAndCount: jest.fn().mockReturnValue([[], 0]),
  };

  const mockDataFetcherClient = {
    send: jest.fn().mockReturnValue(of({})),
    emit: jest.fn().mockReturnValue(of({})),
    connect: jest.fn().mockReturnValue(of({})),
    close: jest.fn().mockReturnValue(of({})),
  };

  const mockAnalyticsClient = {
    send: jest.fn().mockReturnValue(of({})),
    emit: jest.fn().mockReturnValue(of({})),
    connect: jest.fn().mockReturnValue(of({})),
    close: jest.fn().mockReturnValue(of({})),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [],
      providers: [
        SearchDeliveryService,
        {
          provide: getRepositoryToken(TrendingTopic),
          useValue: mockTrendingTopicRepo,
        },
        {
          provide: getRepositoryToken(Publisher),
          useValue: mockPublisherRepo,
        },
        {
          provide: DATA_FETCHER_SERVICE,
          useValue: mockDataFetcherClient,
        },
        {
          provide: ANALYTICS_SERVICE,
          useValue: mockAnalyticsClient,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    searchDeliveryService = app.get<jest.Mocked<SearchDeliveryService>>(
      SearchDeliveryService,
    );
    trendingTopicRepo = app.get(getRepositoryToken(TrendingTopic));
    cacheManager = app.get(CACHE_MANAGER);
  });

  describe('root', () => {
    it('should be defined', () => {
      expect(searchDeliveryService).toBeDefined();
    });
  });

  describe('trendingTopics', () => {
    let result: TrendingTopicsDBResponseDto;
    const query: TrendingTopicsQueryDto = {
      language: 'en',
      topic: ['tech', 'sports'],
      page: 1,
      limit: 10,
      sort: 'popularity',
      country: 'us',
      publisher: ['publisher1', 'publisher2'],
    };

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should call getCacheData', async () => {
      const spy = jest
        .spyOn<any, any>(searchDeliveryService, 'getCacheData')
        .mockResolvedValue(null);

      const expectedCacheKey = CACHE_KEYS.TRENDING_TOPICS(
        query.language,
        query.topic.join(','),
        query.page,
        query.limit,
        query.sort,
        query.country,
        query.publisher.join(','),
      );

      await searchDeliveryService.trendingTopics(query);

      expect(spy).toHaveBeenCalledWith(expectedCacheKey);
    });

    it('should return cached response if it exists', async () => {
      const cachedResponse: TrendingTopicsDBResponseDto = {
        data: [{} as TrendingTopic],
        total: 1,
        page: 1,
        pages: 1,
      };
      jest
        .spyOn<any, any>(searchDeliveryService, 'getCacheData')
        .mockResolvedValue(cachedResponse);
      result = await searchDeliveryService.trendingTopics(query);

      expect(result).toEqual(cachedResponse);
      expect(trendingTopicRepo.createQueryBuilder).not.toHaveBeenCalled();
    });

    describe('when there is no cached response', () => {
      beforeEach(async () => {
        jest
          .spyOn<any, any>(searchDeliveryService, 'getCacheData')
          .mockResolvedValue(undefined);
      });

      it('should build and execute a query', async () => {
        await searchDeliveryService.trendingTopics(query);
        expect(trendingTopicRepo.createQueryBuilder).toHaveBeenCalledWith(
          'trending_topic',
        );
        expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
          'trending_topic.newsClicks',
          'news_click',
        );
        expect(mockQueryBuilder.select).toHaveBeenCalled();
        expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
          'clicks_count',
          'DESC',
        );
        expect(mockQueryBuilder.getRawAndEntities).toHaveBeenCalled();
      });

      it('should call cacheManager.set', async () => {
        await searchDeliveryService.trendingTopics(query);
        expect(cacheManager.set).toHaveBeenCalledWith(
          expect.any(String),
          expect.any(Object),
          expect.any(Number),
        );
      });

      it('should return trending topics', async () => {
        const topics = [] as TrendingTopic[];
        const raw: any[] = [];
        mockQueryBuilder.getRawAndEntities.mockResolvedValue({
          entities: topics,
          raw,
        });

        result = await searchDeliveryService.trendingTopics(query);

        expect(result).toEqual({
          data: topics,
          total: raw.length,
          page: 1,
          pages: Math.ceil(raw.length / query.limit),
        });
      });
    });
  });

  describe('latestNews', () => {
    let result: TrendingTopicsDBResponseDto;
    const query: LatestNewsQueryDto = {
      language: 'en',
      limit: 10,
      topic: 'general',
    };

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should call getCacheData', async () => {
      const spy = jest
        .spyOn<any, any>(searchDeliveryService, 'getCacheData')
        .mockResolvedValue(null);

      const expectedCacheKey = CACHE_KEYS.LATEST_NEWS(
        query.language,
        query.limit,
        query.topic,
      );

      await searchDeliveryService.latestNews(query);

      expect(spy).toHaveBeenCalledWith(expectedCacheKey);
    });

    it('should return cached response if it exists', async () => {
      const cachedResponse: TrendingTopicsDBResponseDto = {
        data: [{} as TrendingTopic],
        total: 1,
        page: 1,
        pages: 1,
      };
      jest
        .spyOn<any, any>(searchDeliveryService, 'getCacheData')
        .mockResolvedValue(cachedResponse);
      result = await searchDeliveryService.latestNews(query);

      expect(result).toEqual(cachedResponse);
      expect(trendingTopicRepo.createQueryBuilder).not.toHaveBeenCalled();
      expect(trendingTopicRepo.findAndCount).not.toHaveBeenCalled();
    });

    describe('when there is no cached response', () => {
      beforeEach(async () => {
        jest
          .spyOn<any, any>(searchDeliveryService, 'getCacheData')
          .mockResolvedValue(undefined);
      });

      it('should call trendingTopicRepo.findAndCount', async () => {
        await searchDeliveryService.latestNews(query);
        expect(trendingTopicRepo.findAndCount).toHaveBeenCalledWith({
          where: { language: query.language, topicId: query.topic },
          order: { date: 'DESC' },
          skip: 0,
          take: query.limit,
          relations: ['publisher'],
        });
      });

      it('should call cacheManager.set', async () => {
        await searchDeliveryService.latestNews(query);
        expect(cacheManager.set).toHaveBeenCalledWith(
          expect.any(String),
          expect.any(Object),
          expect.any(Number),
        );
      });

      it('should return trending topics', async () => {
        const topics = [] as TrendingTopic[];
        const total = 0;
        trendingTopicRepo.findAndCount.mockResolvedValue([topics, total]);
        result = await searchDeliveryService.latestNews(query);

        expect(result).toEqual({
          data: topics,
          total,
          page: 1,
          pages: Math.ceil(total / query.limit),
        });
      });
    });
  });

  describe('searchPublishers', () => {
    let result: PublishersDBResponseDto;
    const query: SearchPublishersQueryDto = {
      name: 'query',
    };

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should call getCacheData', async () => {
      const spy = jest
        .spyOn<any, any>(searchDeliveryService, 'getCacheData')
        .mockResolvedValue(null);

      const expectedCacheKey = CACHE_KEYS.SEARCH_PUBLISHERS(query.name);

      await searchDeliveryService.searchPublishers(query);

      expect(spy).toHaveBeenCalledWith(expectedCacheKey);
    });

    it('should return cached response if it exists', async () => {
      const cachedResponse: PublishersDBResponseDto = {
        data: [] as Publisher[],
        total: 1,
        page: 1,
        pages: 1,
      };
      jest
        .spyOn<any, any>(searchDeliveryService, 'getCacheData')
        .mockResolvedValue(cachedResponse);
      result = await searchDeliveryService.searchPublishers(query);

      expect(result).toEqual(cachedResponse);
      expect(mockPublisherRepo.createQueryBuilder).not.toHaveBeenCalled();
      expect(mockPublisherRepo.findAndCount).not.toHaveBeenCalled();
    });

    describe('when there is no cached response', () => {
      beforeEach(async () => {
        jest
          .spyOn<any, any>(searchDeliveryService, 'getCacheData')
          .mockResolvedValue(undefined);
      });

      it('should call publisherRepo.findAndCount', async () => {
        await searchDeliveryService.searchPublishers(query);
        expect(mockPublisherRepo.findAndCount).toHaveBeenCalledWith({
          where: { name: ILike(`%${query.name}%`) },
          take: 10,
          relations: ['authorStats'],
        });
      });

      it('should call cacheManager.set', async () => {
        await searchDeliveryService.searchPublishers(query);
        expect(cacheManager.set).toHaveBeenCalledWith(
          expect.any(String),
          expect.any(Object),
          expect.any(Number),
        );
      });

      it('should return publishers', async () => {
        const publishers = [] as Publisher[];
        const total = 0;
        mockPublisherRepo.findAndCount.mockResolvedValue([publishers, total]);
        result = await searchDeliveryService.searchPublishers(query);

        expect(result).toEqual({
          data: publishers,
          total,
          page: 1,
          pages: Math.ceil(total / 10),
        });
      });
    });
  });

  describe('registerClick', () => {
    const createNewsClickDto: CreateNewsClickDto = {
      trendingTopicId: 1,
      ipAddress: '127.0.0.1',
      userAgent: 'TEST',
    };

    beforeEach(async () => {
      mockAnalyticsClient.emit.mockReturnValue(of({}));
    });

    it('should call analyticsClient.emit', async () => {
      await searchDeliveryService.registerClick(createNewsClickDto);
      expect(mockAnalyticsClient.emit).toHaveBeenCalledWith('news_click', {
        ...createNewsClickDto,
      });
    });
  });

  describe('frequentlyReadNews', () => {
    let result: FrequentlyReadNewsDto[];
    const limit = 12;

    it('should call getCacheData', async () => {
      const spy = jest
        .spyOn<any, any>(searchDeliveryService, 'getCacheData')
        .mockResolvedValue(null);

      await searchDeliveryService.frequentlyReadNews(limit);

      expect(spy).toHaveBeenCalledWith(CACHE_KEYS.FREQUENTLY_READ_NEWS(limit));
    });

    it('should return cached response if it exists', async () => {
      const cachedResponse: FrequentlyReadNewsDto[] = [];
      jest
        .spyOn<any, any>(searchDeliveryService, 'getCacheData')
        .mockResolvedValue(cachedResponse);
      result = await searchDeliveryService.frequentlyReadNews(limit);

      expect(result).toEqual(cachedResponse);
      expect(mockTrendingTopicRepo.createQueryBuilder).not.toHaveBeenCalled();
      expect(mockTrendingTopicRepo.findAndCount).not.toHaveBeenCalled();
    });

    describe('when there is no cached response', () => {
      beforeEach(async () => {
        jest
          .spyOn<any, any>(searchDeliveryService, 'getCacheData')
          .mockResolvedValue(undefined);
      });

      it('should call analyticsClient.send', async () => {
        await searchDeliveryService.frequentlyReadNews(limit);
        expect(mockAnalyticsClient.send).toHaveBeenCalledWith(
          'frequently_read_news',
          { limit },
        );
      });

      it('should call cacheManager.set', async () => {
        const frequentlyReadNews: ServiceResponseDto<FrequentlyReadNewsDto[]> =
          {
            success: true,
            data: [],
          };
        mockAnalyticsClient.send.mockReturnValue(of(frequentlyReadNews));
        await searchDeliveryService.frequentlyReadNews(limit);
        expect(cacheManager.set).toHaveBeenCalledWith(
          expect.any(String),
          frequentlyReadNews.data,
          expect.any(Number),
        );
      });

      it('should return frequently read news', async () => {
        const frequentlyReadNews: ServiceResponseDto<FrequentlyReadNewsDto[]> =
          {
            success: true,
            data: [],
          };
        mockAnalyticsClient.send.mockReturnValue(of(frequentlyReadNews));
        result = await searchDeliveryService.frequentlyReadNews(limit);

        expect(result).toEqual(frequentlyReadNews.data);
      });
    });
  });

  describe('topAuthors', () => {
    let result: AuthorStatsDto[];
    const limit = 12;

    it('should call getCacheData', async () => {
      const spy = jest
        .spyOn<any, any>(searchDeliveryService, 'getCacheData')
        .mockResolvedValue(null);

      await searchDeliveryService.topAuthors(limit);

      expect(spy).toHaveBeenCalledWith(CACHE_KEYS.TOP_AUTHORS(limit));
    });

    it('should return cached response if it exists', async () => {
      const cachedResponse: AuthorStatsDto[] = [];
      jest
        .spyOn<any, any>(searchDeliveryService, 'getCacheData')
        .mockResolvedValue(cachedResponse);
      result = await searchDeliveryService.topAuthors(limit);

      expect(result).toEqual(cachedResponse);
    });

    describe('when there is no cached response', () => {
      beforeEach(async () => {
        jest
          .spyOn<any, any>(searchDeliveryService, 'getCacheData')
          .mockResolvedValue(undefined);
      });

      it('should call analyticsClient.send', async () => {
        await searchDeliveryService.topAuthors(limit);
        expect(mockAnalyticsClient.send).toHaveBeenCalledWith('top_authors', {
          limit,
        });
      });

      it('should call cacheManager.set', async () => {
        const topAuthors: ServiceResponseDto<AuthorStatsDto[]> = {
          success: true,
          data: [],
        };
        mockAnalyticsClient.send.mockReturnValue(of(topAuthors));
        await searchDeliveryService.topAuthors(limit);
        expect(cacheManager.set).toHaveBeenCalledWith(
          expect.any(String),
          topAuthors.data,
          expect.any(Number),
        );
      });

      it('should return top authors', async () => {
        const topAuthors: ServiceResponseDto<AuthorStatsDto[]> = {
          success: true,
          data: [],
        };
        mockAnalyticsClient.send.mockReturnValue(of(topAuthors));
        result = await searchDeliveryService.topAuthors(limit);

        expect(result).toEqual(topAuthors.data);
      });
    });
  });

  // describe('searchArticles', () => {
  //   let result: SearchArticlesDto[];
  //   const articles = { success: true, data: [] } as DataFetcherResponseDto<
  //     SearchArticlesDto[]
  //   >;
  //   const query = 'query';
  //   const language = 'en';

  //   beforeEach(async () => {
  //     mockDataFetcherClient.send.mockReturnValue(of(articles));
  //     result = await searchDeliveryService.searchArticles(query, language);
  //   });

  //   it('should call dataFetcherClient.send', () => {
  //     expect(mockDataFetcherClient.send).toHaveBeenCalledWith(
  //       'search_articles',
  //       { query, language },
  //     );
  //   });

  //   it('should return articles', () => {
  //     expect(result).toEqual(articles.data);
  //   });

  //   it('should return empty array if dataFetcherClient.send returns status false', async () => {
  //     articles.success = false;
  //     result = await searchDeliveryService.searchArticles(query, language);
  //     expect(result).toEqual([]);
  //   });

  //   it('should throw an error if dataFetcherClient.send throws an error', async () => {
  //     jest.spyOn(mockDataFetcherClient, 'send').mockImplementation(() => {
  //       throw new Error();
  //     });
  //     await expect(
  //       searchDeliveryService.searchArticles(query, language),
  //     ).rejects.toThrow(Error);
  //   });
  // });
});
