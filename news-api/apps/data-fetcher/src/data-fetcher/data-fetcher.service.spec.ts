import { Test, TestingModule } from '@nestjs/testing';
import { DataFetcherService } from './data-fetcher.service';
import { Repository } from 'typeorm';
import { Publisher, TrendingTopic, TrendingTopicDto } from '@app/shared';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('DataFetcherService', () => {
  let dataFetcherService: DataFetcherService;
  let trendingTopicRepo: jest.Mocked<Repository<TrendingTopic>>;
  let publisherRepo: jest.Mocked<Repository<Publisher>>;

  const mockTrendingTopicRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  } as unknown as jest.Mocked<Repository<TrendingTopic>>;

  const mockPublisherRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  } as unknown as jest.Mocked<Repository<TrendingTopic>>;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [],
      providers: [
        DataFetcherService,
        {
          provide: getRepositoryToken(TrendingTopic),
          useValue: mockTrendingTopicRepo,
        },
        {
          provide: getRepositoryToken(Publisher),
          useValue: mockPublisherRepo,
        },
      ],
    }).compile();

    dataFetcherService = app.get<DataFetcherService>(DataFetcherService);
    trendingTopicRepo = app.get(getRepositoryToken(TrendingTopic));
    publisherRepo = app.get(getRepositoryToken(Publisher));
  });

  describe('root', () => {
    it('should be defined', () => {
      expect(dataFetcherService).toBeDefined();
    });
  });

  describe('saveTopics', () => {
    const topics = [
      {
        title: 'test_test_test',
        url: 'https://example.com/test_test_test',
        date: new Date(),
        publisher: {
          name: 'test_test_test',
          url: 'https://example.com/test_test_test',
        },
      },
      {
        title: 'test_test_test2',
        url: 'https://example.com/test_test_test2',
        date: new Date(),
        publisher: {
          name: 'test_test_test2',
          url: 'https://example.com/test_test_test2',
        },
      },
    ] as TrendingTopicDto[];

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should check if topic already exists', async () => {
      await dataFetcherService.saveTopics(topics);

      for (const topic of topics) {
        expect(trendingTopicRepo.findOne).toHaveBeenCalledWith({
          where: {
            title: topic.title,
            url: topic.url,
            date: topic.date,
          },
        });
      }
    });

    it('should skip if topic already exists', async () => {
      trendingTopicRepo.findOne.mockResolvedValue({} as TrendingTopic);
      await dataFetcherService.saveTopics(topics);

      expect(trendingTopicRepo.save).not.toHaveBeenCalled();
      expect(publisherRepo.save).not.toHaveBeenCalled();
    });

    describe('when topic does not exist', () => {
      beforeEach(async () => {
        trendingTopicRepo.findOne.mockResolvedValue(null);
      });

      it('should check if publisher exists', async () => {
        await dataFetcherService.saveTopics(topics);

        for (const topic of topics) {
          expect(publisherRepo.findOne).toHaveBeenCalledWith({
            where: {
              name: topic.publisher.name,
              url: topic.publisher.url,
            },
          });
        }
      });

      it('should create publisher if it does not exist', async () => {
        publisherRepo.findOne.mockResolvedValue(null);
        await dataFetcherService.saveTopics(topics);

        for (const topic of topics) {
          expect(publisherRepo.create).toHaveBeenCalledWith(topic.publisher);
          const publisher = publisherRepo.create(topic.publisher);
          expect(publisherRepo.save).toHaveBeenCalledWith(publisher);
        }
      });

      it('should save new topics', async () => {
        publisherRepo.findOne
          .mockResolvedValueOnce(topics[0].publisher as Publisher)
          .mockResolvedValueOnce(topics[1].publisher as Publisher);

        await dataFetcherService.saveTopics(topics);

        for (const topic of topics) {
          const publisher = topic.publisher;
          expect(trendingTopicRepo.create).toHaveBeenCalledWith({
            ...topic,
            publisher,
          });
          const newTopic = trendingTopicRepo.create({
            ...topic,
            publisher,
          });
          expect(trendingTopicRepo.save).toHaveBeenCalledWith(newTopic);
        }
      });

      it('should throw an error if trendingTopicRepo.save throws', async () => {
        trendingTopicRepo.save.mockRejectedValue(new Error());

        await expect(dataFetcherService.saveTopics(topics)).rejects.toThrow(
          Error,
        );
      });
    });
  });
});
