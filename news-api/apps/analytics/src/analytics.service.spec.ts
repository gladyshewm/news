import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { Repository, SelectQueryBuilder } from 'typeorm';
import {
  AuthorStat,
  AuthorStatsDto,
  CreateNewsClickDto,
  FrequentlyReadNewsDto,
  NewsClick,
  Publisher,
  TrendingTopic,
} from '@app/shared';
import { RmqService } from '@app/rmq';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RmqContext } from '@nestjs/microservices';
import { FrequentlyReadNewsPayload } from './dto/frequently-read-news-payload.dto';
import { TopAuthorsPayload } from './dto/top-authors-payload.dto';

describe('AnalyticsService', () => {
  let analyticsService: AnalyticsService;
  let publisherRepo: jest.Mocked<Repository<Publisher>>;
  let authorStatRepo: jest.Mocked<Repository<AuthorStat>>;
  let trendingTopicRepo: jest.Mocked<Repository<TrendingTopic>>;

  const mockTrendingTopicQueryBuilder = {
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
  const mockAuthorStatQueryBuilder = {
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
  } as unknown as jest.Mocked<SelectQueryBuilder<AuthorStat>>;

  const mockTrendingTopicRepo = {
    createQueryBuilder: jest
      .fn()
      .mockReturnValue(mockTrendingTopicQueryBuilder),
    findOne: jest.fn(),
    findAndCount: jest.fn().mockReturnValue([[], 0]),
    count: jest.fn(),
  };
  const mockNewsClickRepo = {
    create: jest.fn(),
    save: jest.fn(),
  };
  const mockAuthorStatRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue(mockAuthorStatQueryBuilder),
  };
  const mockPublisherRepo = {
    find: jest.fn(),
  };

  const mockRmqService = {
    ack: jest.fn(),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: getRepositoryToken(TrendingTopic),
          useValue: mockTrendingTopicRepo,
        },
        {
          provide: getRepositoryToken(NewsClick),
          useValue: mockNewsClickRepo,
        },
        {
          provide: getRepositoryToken(AuthorStat),
          useValue: mockAuthorStatRepo,
        },
        {
          provide: getRepositoryToken(Publisher),
          useValue: mockPublisherRepo,
        },
        {
          provide: RmqService,
          useValue: mockRmqService,
        },
      ],
    }).compile();

    analyticsService = app.get<AnalyticsService>(AnalyticsService);
    publisherRepo = app.get<jest.Mocked<Repository<Publisher>>>(
      getRepositoryToken(Publisher),
    );
    authorStatRepo = app.get<jest.Mocked<Repository<AuthorStat>>>(
      getRepositoryToken(AuthorStat),
    );
    trendingTopicRepo = app.get<jest.Mocked<Repository<TrendingTopic>>>(
      getRepositoryToken(TrendingTopic),
    );
  });

  describe('root', () => {
    it('should be defined', () => {
      expect(analyticsService).toBeDefined();
    });
  });

  describe('onModuleInit', () => {
    it('should call initializeAuthorStats', async () => {
      jest.spyOn(analyticsService, 'initializeAuthorStats');
      await analyticsService.onModuleInit();

      expect(analyticsService.initializeAuthorStats).toHaveBeenCalled();
    });
  });

  describe('initializeAuthorStats', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should get all publishers', async () => {
      await analyticsService.initializeAuthorStats();
      expect(publisherRepo.find).toHaveBeenCalled();
    });

    it('should get all existing stats', async () => {
      await analyticsService.initializeAuthorStats();
      expect(authorStatRepo.find).toHaveBeenCalled();
    });

    it('should create new stats for new publishers', async () => {
      publisherRepo.find.mockResolvedValue([{ id: 1 } as Publisher]);
      authorStatRepo.find.mockResolvedValue([{ id: 1 } as AuthorStat]);

      await analyticsService.initializeAuthorStats();

      const publishers = await publisherRepo.find();
      const existingStats = await authorStatRepo.find();
      const existingPublisherIds = new Set(
        existingStats.map((stat) => stat.publisherId),
      );

      publishers
        .filter((publisher) => !existingPublisherIds.has(publisher.id))
        .map((publisher) => {
          expect(authorStatRepo.create).toHaveBeenCalledWith({
            publisherId: publisher.id,
            totalArticles: 1,
            totalClicks: 0,
            lastUpdated: expect.any(Date),
          });
        });
    });

    it('should save new author stats if there are any', async () => {
      publisherRepo.find.mockResolvedValue([{ id: 1 } as Publisher]);
      authorStatRepo.find.mockResolvedValue([{ id: 1 } as AuthorStat]);

      await analyticsService.initializeAuthorStats();

      expect(authorStatRepo.save).toHaveBeenCalled();
    });

    it('should not save new author stats if there are none', async () => {
      publisherRepo.find.mockResolvedValue([{ id: 1 } as Publisher]);
      authorStatRepo.find.mockResolvedValue([
        { id: 1, publisherId: 1 } as AuthorStat,
      ]);

      await analyticsService.initializeAuthorStats();

      expect(authorStatRepo.create).not.toHaveBeenCalled();
      expect(authorStatRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('updateTotalArticles', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should get list of all authors', async () => {
      await analyticsService.updateTotalArticles();
      expect(authorStatRepo.find).toHaveBeenCalled();
    });

    it('should count the number of articles for each author', async () => {
      const authors = [
        { id: 1, publisherId: 1 } as AuthorStat,
        { id: 2, publisherId: 2 } as AuthorStat,
      ];
      authorStatRepo.find.mockResolvedValue(authors);
      await analyticsService.updateTotalArticles();
      expect(trendingTopicRepo.count).toHaveBeenCalledTimes(2);
    });

    it('should save the updated author stats', async () => {
      const authors = [
        { id: 1, publisherId: 1 } as AuthorStat,
        { id: 2, publisherId: 2 } as AuthorStat,
      ];
      authorStatRepo.find.mockResolvedValue(authors);
      await analyticsService.updateTotalArticles();
      expect(authorStatRepo.save).toHaveBeenCalledTimes(2);
    });
  });

  describe('registerClick', () => {
    const createNewsClickDto: CreateNewsClickDto = {
      trendingTopicId: 1,
      ipAddress: '127.0.0.1',
      userAgent: 'TEST',
    };
    const ctx = {} as RmqContext;
    const topic = {
      id: 1,
      publisher: {
        id: 1,
      },
    } as TrendingTopic;

    beforeEach(async () => {
      trendingTopicRepo.findOne.mockResolvedValue(topic);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should call newsClickRepository.save', async () => {
      await analyticsService.registerClick(createNewsClickDto, ctx);
      expect(mockNewsClickRepo.create).toHaveBeenCalled();
      expect(mockNewsClickRepo.save).toHaveBeenCalled();
    });

    it('should find the relevant topic', async () => {
      await analyticsService.registerClick(createNewsClickDto, ctx);
      expect(trendingTopicRepo.findOne).toHaveBeenCalledWith({
        where: { id: createNewsClickDto.trendingTopicId },
        relations: ['publisher'],
      });
    });

    it('should throw an error if the topic or publisher is not found', async () => {
      trendingTopicRepo.findOne.mockResolvedValue(null);
      await expect(
        analyticsService.registerClick(createNewsClickDto, ctx),
      ).rejects.toThrow(Error);
    });

    it('should update author stats', async () => {
      const stat = { id: 1, publisherId: 1, totalClicks: 6 } as AuthorStat;
      authorStatRepo.findOne.mockResolvedValue({ ...stat });
      await analyticsService.registerClick(createNewsClickDto, ctx);

      expect(authorStatRepo.findOne).toHaveBeenCalled();
      expect(authorStatRepo.save).toHaveBeenCalledWith({
        id: stat.id,
        publisherId: stat.publisherId,
        totalClicks: stat.totalClicks + 1,
        lastUpdated: expect.any(Date),
      });
    });

    it('should call rmqService.ack', async () => {
      await analyticsService.registerClick(createNewsClickDto, ctx);
      expect(mockRmqService.ack).toHaveBeenCalledWith(ctx);
    });
  });

  describe('getFrequentlyReadNews', () => {
    let result: FrequentlyReadNewsDto[];
    const limit = 11;

    beforeEach(async () => {
      result = await analyticsService.getFrequentlyReadNews(limit);
    });

    it('should create a query', () => {
      expect(mockTrendingTopicQueryBuilder.select).toHaveBeenCalled();
      expect(mockTrendingTopicQueryBuilder.limit).toHaveBeenCalledWith(limit);
    });

    it('should return an array of frequently read news', () => {
      expect(result).toBeInstanceOf(Array);
    });

    it('should return an empty array if there are no results', async () => {
      mockTrendingTopicQueryBuilder.getRawAndEntities.mockResolvedValue({
        entities: [],
        raw: [],
      });
      result = await analyticsService.getFrequentlyReadNews(limit);
      expect(result).toEqual([]);
    });

    it('should throw an error if trending topic repo throws an error', async () => {
      mockTrendingTopicQueryBuilder.getRawAndEntities.mockRejectedValue(
        new Error('Error'),
      );
      await expect(
        analyticsService.getFrequentlyReadNews(limit),
      ).rejects.toThrow(Error);
    });
  });

  describe('frequentlyReadNews', () => {
    let result: FrequentlyReadNewsDto[];
    const payload: FrequentlyReadNewsPayload = { limit: 10 };
    const ctx = {} as RmqContext;
    const news = [] as FrequentlyReadNewsDto[];

    beforeEach(async () => {
      jest
        .spyOn(analyticsService, 'getFrequentlyReadNews')
        .mockResolvedValue(news);
      result = await analyticsService.frequentlyReadNews(payload, ctx);
    });

    it('should call getFrequentlyReadNews', () => {
      expect(analyticsService.getFrequentlyReadNews).toHaveBeenCalledWith(
        payload.limit,
      );
    });

    it('should return frequently read news', () => {
      expect(result).toEqual(news);
    });

    it('should throw an error if getFrequentlyReadNews throws an error', async () => {
      jest
        .spyOn(analyticsService, 'getFrequentlyReadNews')
        .mockRejectedValue(new Error('Error'));
      await expect(
        analyticsService.frequentlyReadNews(payload, ctx),
      ).rejects.toThrow(Error);
    });

    it('should call rmqService.ack', async () => {
      expect(mockRmqService.ack).toHaveBeenCalledWith(ctx);
    });
  });

  describe('getTopAuthors', () => {
    let result: AuthorStatsDto[];
    const limit = 12;

    beforeEach(async () => {
      result = await analyticsService.getTopAuthors(limit);
    });

    it('should create a query', () => {
      expect(mockAuthorStatQueryBuilder.select).toHaveBeenCalled();
      expect(mockAuthorStatQueryBuilder.limit).toHaveBeenCalledWith(limit);
    });

    it('should return an array of top authors', () => {
      expect(result).toBeInstanceOf(Array);
    });

    it('should return an empty array if there are no results', async () => {
      mockAuthorStatQueryBuilder.getRawAndEntities.mockResolvedValue({
        entities: [],
        raw: [],
      });
      result = await analyticsService.getTopAuthors(limit);
      expect(result).toEqual([]);
    });

    it('should throw an error if author stat repo throws an error', async () => {
      mockAuthorStatQueryBuilder.getRawAndEntities.mockRejectedValue(
        new Error('Error'),
      );
      await expect(analyticsService.getTopAuthors(limit)).rejects.toThrow(
        Error,
      );
    });
  });

  describe('topAuthors', () => {
    let result: AuthorStatsDto[];
    const payload: TopAuthorsPayload = { limit: 10 };
    const ctx = {} as RmqContext;
    const authors = [] as AuthorStatsDto[];

    beforeEach(async () => {
      jest.spyOn(analyticsService, 'getTopAuthors').mockResolvedValue(authors);
      result = await analyticsService.topAuthors(payload, ctx);
    });

    it('should call getTopAuthors', () => {
      expect(analyticsService.getTopAuthors).toHaveBeenCalledWith(
        payload.limit,
      );
    });

    it('should return top authors', () => {
      expect(result).toEqual(authors);
    });

    it('should throw an error if getTopAuthors throws an error', async () => {
      jest
        .spyOn(analyticsService, 'getTopAuthors')
        .mockRejectedValue(new Error('Error'));
      await expect(analyticsService.topAuthors(payload, ctx)).rejects.toThrow(
        Error,
      );
    });

    it('should call rmqService.ack', async () => {
      expect(mockRmqService.ack).toHaveBeenCalledWith(ctx);
    });
  });
});
