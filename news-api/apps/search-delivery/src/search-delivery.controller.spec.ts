import { Test, TestingModule } from '@nestjs/testing';
import { SearchDeliveryController } from './search-delivery.controller';
import { SearchDeliveryService } from './search-delivery.service';
import { TrendingTopicsDBResponseDto } from './dto/trending-topics-db-res.dto';
import {
  AuthorStatsDto,
  FrequentlyReadNewsDto,
  SearchArticlesDto,
} from '@app/shared';
import { TrendingTopicsQueryDto } from './dto/trending-topics-query.dto';
import { SearchArticlesQueryDto } from './dto/search-articles-query.dto';
import { SearchPublishersQueryDto } from './dto/search-publishers-query.dto';
import { PublishersDBResponseDto } from './dto/publishers-db-res.dto';
import { LatestNewsQueryDto } from './dto/latest-news-query.dto';
import { Request } from 'express';

jest.mock('./search-delivery.service');

describe('SearchDeliveryController', () => {
  let searchDeliveryController: SearchDeliveryController;
  let searchDeliveryService: jest.Mocked<SearchDeliveryService>;

  const mockRequest = {
    ip: '127.0.0.1',
    headers: { 'user-agent': 'Mozilla/5.0 TEST' },
  } as Request;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [SearchDeliveryController],
      providers: [SearchDeliveryService],
    }).compile();

    searchDeliveryController = app.get<SearchDeliveryController>(
      SearchDeliveryController,
    );
    searchDeliveryService = app.get<jest.Mocked<SearchDeliveryService>>(
      SearchDeliveryService,
    );
  });

  describe('root', () => {
    it('should be defined', () => {
      expect(searchDeliveryController).toBeDefined();
    });
  });

  describe('trendingTopics', () => {
    let trendingTopics: TrendingTopicsDBResponseDto;
    const query: TrendingTopicsQueryDto = {} as TrendingTopicsQueryDto;
    const topics: TrendingTopicsDBResponseDto =
      {} as TrendingTopicsDBResponseDto;

    beforeEach(async () => {
      searchDeliveryService.trendingTopics.mockResolvedValue(topics);
      trendingTopics = await searchDeliveryController.trendingTopics(query);
    });

    it('should call searchDeliveryService.trendingTopics', () => {
      expect(searchDeliveryService.trendingTopics).toHaveBeenCalledWith(query);
    });

    it('should return trending topics', () => {
      expect(trendingTopics).toEqual(topics);
    });

    it('should throw an error if searchDeliveryService.trendingTopics throws an error', async () => {
      searchDeliveryService.trendingTopics.mockRejectedValue(new Error());
      await expect(
        searchDeliveryController.trendingTopics(query),
      ).rejects.toThrow(Error);
    });
  });

  describe('latestNews', () => {
    let latestNews: TrendingTopicsDBResponseDto;
    const query: LatestNewsQueryDto = {} as LatestNewsQueryDto;
    const topics: TrendingTopicsDBResponseDto =
      {} as TrendingTopicsDBResponseDto;

    beforeEach(async () => {
      searchDeliveryService.latestNews.mockResolvedValue(topics);
      latestNews = await searchDeliveryController.latestNews(query);
    });

    it('should call searchDeliveryService.latestNews', () => {
      expect(searchDeliveryService.latestNews).toHaveBeenCalledWith(query);
    });

    it('should return latest news', () => {
      expect(latestNews).toEqual(topics);
    });

    it('should throw an error if searchDeliveryService.latestNews throws an error', async () => {
      searchDeliveryService.latestNews.mockRejectedValue(new Error());
      await expect(searchDeliveryController.latestNews(query)).rejects.toThrow(
        Error,
      );
    });
  });

  describe('searchArticles', () => {
    let searchArticles: SearchArticlesDto[];
    const articles: SearchArticlesDto[] = [];
    const query: SearchArticlesQueryDto = {} as SearchArticlesQueryDto;

    beforeEach(async () => {
      searchDeliveryService.searchArticles.mockResolvedValue(articles);
      searchArticles = await searchDeliveryController.searchArticles(query);
    });

    it('should call searchDeliveryService.searchArticles', () => {
      expect(searchDeliveryService.searchArticles).toHaveBeenCalledWith(query);
    });

    it('should return search articles', () => {
      expect(searchArticles).toEqual(articles);
    });

    it('should throw an error if searchDeliveryService.searchArticles throws an error', async () => {
      searchDeliveryService.searchArticles.mockRejectedValue(new Error());
      await expect(
        searchDeliveryController.searchArticles(query),
      ).rejects.toThrow(Error);
    });
  });

  describe('searchPublishers', () => {
    let searchPublishers: PublishersDBResponseDto;
    const publishers: PublishersDBResponseDto = {} as PublishersDBResponseDto;
    const query: SearchPublishersQueryDto = {} as SearchPublishersQueryDto;

    beforeEach(async () => {
      searchDeliveryService.searchPublishers.mockResolvedValue(publishers);
      searchPublishers = await searchDeliveryController.searchPublishers(query);
    });

    it('should call searchDeliveryService.searchPublishers', () => {
      expect(searchDeliveryService.searchPublishers).toHaveBeenCalledWith(
        query,
      );
    });

    it('should return search publishers', () => {
      expect(searchPublishers).toEqual(publishers);
    });

    it('should throw an error if searchDeliveryService.searchPublishers throws an error', async () => {
      searchDeliveryService.searchPublishers.mockRejectedValue(new Error());
      await expect(
        searchDeliveryController.searchPublishers(query),
      ).rejects.toThrow(Error);
    });
  });

  describe('registerClick', () => {
    const trendingTopicId = 1;

    beforeEach(async () => {
      await searchDeliveryController.registerClick(
        trendingTopicId,
        mockRequest,
      );
    });

    it('should call searchDeliveryService.registerClick', () => {
      expect(searchDeliveryService.registerClick).toHaveBeenCalledWith({
        trendingTopicId,
        ipAddress: mockRequest.ip,
        userAgent: mockRequest.headers['user-agent'],
      });
    });

    it('should throw an error if searchDeliveryService.registerClick throws an error', async () => {
      searchDeliveryService.registerClick.mockRejectedValue(new Error());
      await expect(
        searchDeliveryController.registerClick(trendingTopicId, mockRequest),
      ).rejects.toThrow(Error);
    });
  });

  describe('frequentlyReadNews', () => {
    let frequentlyReadNews: FrequentlyReadNewsDto[];
    const news = [] as FrequentlyReadNewsDto[];
    const limit = 22;

    beforeEach(async () => {
      searchDeliveryService.frequentlyReadNews.mockResolvedValue(news);
      frequentlyReadNews =
        await searchDeliveryController.frequentlyReadNews(limit);
    });

    it('should call searchDeliveryService.frequentlyReadNews', () => {
      expect(searchDeliveryService.frequentlyReadNews).toHaveBeenCalledWith(
        limit,
      );
    });

    it('should return frequently read news', () => {
      expect(frequentlyReadNews).toEqual(news);
    });

    it('should throw an error if searchDeliveryService.frequentlyReadNews throws an error', async () => {
      searchDeliveryService.frequentlyReadNews.mockRejectedValue(new Error());
      await expect(
        searchDeliveryController.frequentlyReadNews(limit),
      ).rejects.toThrow(Error);
    });
  });

  describe('topAuthors', () => {
    let topAuthors: AuthorStatsDto[];
    const authors = [] as AuthorStatsDto[];
    const limit = 22;

    beforeEach(async () => {
      searchDeliveryService.topAuthors.mockResolvedValue(authors);
      topAuthors = await searchDeliveryController.topAuthors(limit);
    });

    it('should call searchDeliveryService.topAuthors', () => {
      expect(searchDeliveryService.topAuthors).toHaveBeenCalledWith(limit);
    });

    it('should return top authors', () => {
      expect(topAuthors).toEqual(authors);
    });

    it('should throw an error if searchDeliveryService.topAuthors throws an error', async () => {
      searchDeliveryService.topAuthors.mockRejectedValue(new Error());
      await expect(searchDeliveryController.topAuthors(limit)).rejects.toThrow(
        Error,
      );
    });
  });
});
