import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import {
  AuthorStatsDto,
  CreateNewsClickDto,
  FrequentlyReadNewsDto,
  ServiceResponseDto,
} from '@app/shared';
import { RmqContext } from '@nestjs/microservices';
import { FrequentlyReadNewsPayload } from './dto/frequently-read-news-payload.dto';
import { TopAuthorsPayload } from './dto/top-authors-payload.dto';

jest.mock('./analytics.service');

describe('AnalyticsController', () => {
  let analyticsController: AnalyticsController;
  let analyticsService: jest.Mocked<AnalyticsService>;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [AnalyticsService],
    }).compile();

    analyticsController = app.get<AnalyticsController>(AnalyticsController);
    analyticsService = app.get<jest.Mocked<AnalyticsService>>(AnalyticsService);
  });

  describe('root', () => {
    it('should be defined', () => {
      expect(analyticsController).toBeDefined();
    });
  });

  describe('handleNewsClick', () => {
    const payload: CreateNewsClickDto = {
      trendingTopicId: 1,
      ipAddress: '127.0.0.1',
      userAgent: 'TEST',
    };
    const ctx = {} as RmqContext;

    it('should call analyticsService.registerClick', async () => {
      await analyticsController.handleNewsClick(payload, ctx);
      expect(analyticsService.registerClick).toHaveBeenCalledWith(payload, ctx);
    });

    it('should throw an error if analyticsService.registerClick throws an error', async () => {
      analyticsService.registerClick.mockRejectedValue(new Error());
      await expect(
        analyticsController.handleNewsClick(payload, ctx),
      ).rejects.toThrow(Error);
    });
  });

  describe('frequentlyReadNews', () => {
    let result: ServiceResponseDto<FrequentlyReadNewsDto[]>;
    const payload: FrequentlyReadNewsPayload = { limit: 10 };
    const ctx = {} as RmqContext;
    const news = [] as FrequentlyReadNewsDto[];

    beforeEach(async () => {
      analyticsService.frequentlyReadNews.mockResolvedValue(news);
      result = await analyticsController.frequentlyReadNews(payload, ctx);
    });

    it('should call analyticsService.frequentlyReadNews', () => {
      expect(analyticsService.frequentlyReadNews).toHaveBeenCalledWith(
        payload,
        ctx,
      );
    });

    it('should return success and data', () => {
      expect(result).toEqual({ success: true, data: news });
    });

    it('should return success and error message if analyticsService.frequentlyReadNews throws an error', async () => {
      analyticsService.frequentlyReadNews.mockRejectedValue(new Error('Error'));
      result = await analyticsController.frequentlyReadNews(payload, ctx);
      expect(result).toEqual({ success: false, data: null, error: 'Error' });
    });
  });

  describe('topAuthors', () => {
    let result: ServiceResponseDto<AuthorStatsDto[]>;
    const payload: TopAuthorsPayload = { limit: 10 };
    const ctx = {} as RmqContext;
    const authors = [] as AuthorStatsDto[];

    beforeEach(async () => {
      analyticsService.topAuthors.mockResolvedValue(authors);
      result = await analyticsController.topAuthors(payload, ctx);
    });

    it('should call analyticsService.topAuthors', () => {
      expect(analyticsService.topAuthors).toHaveBeenCalledWith(payload, ctx);
    });

    it('should return success and data', () => {
      expect(result).toEqual({ success: true, data: authors });
    });

    it('should return success and error message if analyticsService.frequentlyReadNews throws an error', async () => {
      analyticsService.topAuthors.mockRejectedValue(new Error('Error'));
      result = await analyticsController.topAuthors(payload, ctx);
      expect(result).toEqual({ success: false, data: null, error: 'Error' });
    });
  });
});
