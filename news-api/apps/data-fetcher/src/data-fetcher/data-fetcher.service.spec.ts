import { Test, TestingModule } from '@nestjs/testing';
import { DataFetcherService } from './data-fetcher.service';
import { TrendingTopicRepository } from './trending-topic.repository';
import { TrendingTopicDto } from '../dto/trending-topic.dto';

describe('DataFetcherService', () => {
  let dataFetcherService: DataFetcherService;
  let trendingTopicRepo: jest.Mocked<TrendingTopicRepository>;

  const mockTrendingTopicRepo = {
    save: jest.fn(),
  } as unknown as jest.Mocked<TrendingTopicRepository>;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [],
      providers: [
        DataFetcherService,
        {
          provide: TrendingTopicRepository,
          useValue: mockTrendingTopicRepo,
        },
      ],
    }).compile();

    dataFetcherService = app.get<DataFetcherService>(DataFetcherService);
    trendingTopicRepo = app.get<jest.Mocked<TrendingTopicRepository>>(
      TrendingTopicRepository,
    );
  });

  describe('root', () => {
    it('should be defined', () => {
      expect(dataFetcherService).toBeDefined();
    });
  });

  describe('saveTopics', () => {
    const topics: TrendingTopicDto[] = [];

    beforeEach(async () => {
      await dataFetcherService.saveTopics(topics);
    });

    it('should call trendingTopicRepo.save', () => {
      expect(trendingTopicRepo.save).toHaveBeenCalledWith(topics);
    });

    it('should throw an error if trendingTopicRepo.save throws', async () => {
      trendingTopicRepo.save.mockRejectedValue(new Error());

      await expect(dataFetcherService.saveTopics(topics)).rejects.toThrow(
        Error,
      );
    });
  });
});
