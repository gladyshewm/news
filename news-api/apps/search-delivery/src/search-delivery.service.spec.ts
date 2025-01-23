import { Test, TestingModule } from '@nestjs/testing';
import { SearchDeliveryService } from './search-delivery.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TrendingTopic } from './entities/trending-topic.entity';
import { DATA_FETCHER_SERVICE } from './constants/services.constant';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { Cache } from 'cache-manager';
import { TrendingTopicsDBResponseDto } from './dto/trending-topics-db-res.dto';
import { of } from 'rxjs';
import { SearchArticlesDto } from './dto/search-articles.dto';
import { SearchPublishersDto } from './dto/search-publishers.dto';
import { DataFetcherResponseDto } from './dto/data-fetcher-response.dto';

describe('SearchDeliveryService', () => {
  let searchDeliveryService: SearchDeliveryService;
  let trendingTopicRepo: jest.Mocked<Repository<TrendingTopic>>;
  let dataFetcherClient: jest.Mocked<ClientProxy>;
  let cacheManager: jest.Mocked<Cache>;

  const mockTrendingTopicRepo = {
    findAndCount: jest.fn(),
  };

  const mockDataFetcherClient = {
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
          provide: DATA_FETCHER_SERVICE,
          useValue: mockDataFetcherClient,
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
    dataFetcherClient = app.get(DATA_FETCHER_SERVICE);
    cacheManager = app.get(CACHE_MANAGER);
  });

  describe('root', () => {
    it('should be defined', () => {
      expect(searchDeliveryService).toBeDefined();
    });
  });

  describe('trendingTopics', () => {
    let result: TrendingTopicsDBResponseDto;
    const language = 'en';
    const topic = 'Sports';
    const page = 1;
    const limit = 10;
    const sort = 'date';

    beforeEach(async () => {
      mockTrendingTopicRepo.findAndCount.mockResolvedValue([[], 0]);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should call getCacheKeyTrendingTopics', async () => {
      const spy = jest.spyOn<any, any>(
        searchDeliveryService,
        'getCacheKeyTrendingTopics',
      );
      await searchDeliveryService.trendingTopics(
        language,
        topic,
        page,
        limit,
        sort,
      );

      expect(spy).toHaveBeenCalledWith(language, topic, page, limit, sort);
    });

    /* it('should call getTrendingTopicsFromCache with cacheKey', async () => {
      const spy = jest.spyOn<any, any>(
        searchDeliveryService,
        'getTrendingTopicsFromCache',
      );
      await searchDeliveryService.trendingTopics(
        language,
        topic,
        page,
        limit,
        sort,
      );

      expect(spy).toHaveBeenCalledWith(expect.any(String));
    });

    it('should return cached response if it exists', async () => {
      const cachedResponse: TrendingTopicsDBResponseDto = {
        data: [{} as TrendingTopicDto],
        total: 1,
        page: 1,
        pages: 1,
      };
      jest
        .spyOn<any, any>(searchDeliveryService, 'getTrendingTopicsFromCache')
        .mockResolvedValue(cachedResponse);
      result = await searchDeliveryService.trendingTopics(
        language,
        topic,
        page,
        limit,
        sort,
      );

      expect(result).toEqual(cachedResponse);
      expect(trendingTopicRepo.findAndCount).not.toHaveBeenCalled();
    }); */

    describe('when there is no cached response', () => {
      beforeEach(async () => {
        jest
          .spyOn<any, any>(searchDeliveryService, 'getTrendingTopicsFromCache')
          .mockResolvedValue(undefined);
      });

      it('should call trendingTopicRepo.findAndCount', async () => {
        await searchDeliveryService.trendingTopics(
          language,
          topic,
          page,
          limit,
          sort,
        );
        expect(trendingTopicRepo.findAndCount).toHaveBeenCalledWith({
          where: { language, topicId: topic },
          order: { [sort]: 'DESC' },
          skip: (page - 1) * limit,
          take: limit,
          relations: ['publisher'],
        });
      });

      it('should call cacheManager.set', async () => {
        await searchDeliveryService.trendingTopics(
          language,
          topic,
          page,
          limit,
          sort,
        );
        expect(cacheManager.set).toHaveBeenCalledWith(
          expect.any(String),
          expect.any(Object),
          expect.any(Number),
        );
      });

      it('should return trending topics', async () => {
        const [topics, count] = [[], 5];
        trendingTopicRepo.findAndCount.mockResolvedValue([topics, count]);
        result = await searchDeliveryService.trendingTopics(
          language,
          topic,
          page,
          limit,
          sort,
        );

        expect(result).toEqual({
          data: topics,
          total: count,
          page,
          pages: Math.ceil(count / limit),
        });
      });

      describe('when there are no trending topics', () => {
        const [topics, count] = [[], 0];

        beforeEach(async () => {
          trendingTopicRepo.findAndCount.mockResolvedValue([topics, count]);
          result = await searchDeliveryService.trendingTopics(
            language,
            topic,
            page,
            limit,
            sort,
          );
        });

        it('should call dataFetcherClient.send', () => {
          expect(dataFetcherClient.send).toHaveBeenCalledWith(
            'trending_topics',
            {
              language,
              topic,
            },
          );
          expect(dataFetcherClient.send).toHaveBeenCalledTimes(1);
        });

        it('should re-request trending topics from repo', () => {
          expect(trendingTopicRepo.findAndCount).toHaveBeenCalledWith({
            where: { language, topicId: topic },
            order: { [sort]: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
            relations: ['publisher'],
          });
          expect(trendingTopicRepo.findAndCount).toHaveBeenCalledTimes(2);
        });

        it('should call cacheManager.set', async () => {
          expect(cacheManager.set).toHaveBeenCalledWith(
            expect.any(String),
            expect.any(Object),
            expect.any(Number),
          );
        });

        it('should return updated trending topics', async () => {
          trendingTopicRepo.findAndCount.mockResolvedValue([topics, count + 1]);
          result = await searchDeliveryService.trendingTopics(
            language,
            topic,
            page,
            limit,
            sort,
          );

          expect(result).toEqual({
            data: topics,
            total: count + 1,
            page,
            pages: Math.ceil(count + 1 / limit),
          });
        });
      });
    });
  });

  describe('searchArticles', () => {
    let result: SearchArticlesDto[];
    const articles = { success: true, data: [] } as DataFetcherResponseDto<
      SearchArticlesDto[]
    >;
    const query = 'query';
    const language = 'en';

    beforeEach(async () => {
      mockDataFetcherClient.send.mockReturnValue(of(articles));
      result = await searchDeliveryService.searchArticles(query, language);
    });

    it('should call dataFetcherClient.send', () => {
      expect(mockDataFetcherClient.send).toHaveBeenCalledWith(
        'search_articles',
        { query, language },
      );
    });

    it('should return articles', () => {
      expect(result).toEqual(articles.data);
    });

    it('should return empty array if dataFetcherClient.send returns status false', async () => {
      articles.success = false;
      result = await searchDeliveryService.searchArticles(query, language);
      expect(result).toEqual([]);
    });

    it('should throw an error if dataFetcherClient.send throws an error', async () => {
      jest.spyOn(mockDataFetcherClient, 'send').mockImplementation(() => {
        throw new Error();
      });
      await expect(
        searchDeliveryService.searchArticles(query, language),
      ).rejects.toThrow(Error);
    });
  });

  describe('searchPublishers', () => {
    let result: SearchPublishersDto[];
    const publishers = { success: true, data: [] } as DataFetcherResponseDto<
      SearchPublishersDto[]
    >;
    const query = 'query';
    const country = 'country';
    const language = 'en';
    const category = 'category';

    beforeEach(async () => {
      mockDataFetcherClient.send.mockReturnValue(of(publishers));
      result = await searchDeliveryService.searchPublishers(
        query,
        country,
        language,
        category,
      );
    });

    it('should call dataFetcherClient.send', () => {
      expect(mockDataFetcherClient.send).toHaveBeenCalledWith(
        'search_publishers',
        { query, country, language, category },
      );
    });

    it('should return publishers', () => {
      expect(result).toEqual(publishers.data);
    });

    it('should return empty array if dataFetcherClient.send returns status false', async () => {
      publishers.success = false;
      result = await searchDeliveryService.searchPublishers(
        query,
        country,
        language,
        category,
      );
      expect(result).toEqual([]);
    });

    it('should throw an error if dataFetcherClient.send throws an error', async () => {
      jest.spyOn(mockDataFetcherClient, 'send').mockImplementation(() => {
        throw new Error();
      });
      await expect(
        searchDeliveryService.searchArticles(query, language),
      ).rejects.toThrow(Error);
    });
  });
});
