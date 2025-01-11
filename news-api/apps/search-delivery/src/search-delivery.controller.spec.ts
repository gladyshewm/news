import { Test, TestingModule } from '@nestjs/testing';
import { SearchDeliveryController } from './search-delivery.controller';
import { SearchDeliveryService } from './search-delivery.service';
import { TrendingTopicsDBResponseDto } from './dto/trending-topics-db-res.dto';
import { SearchArticlesDto } from './dto/search-articles.dto';
import { SearchPublishersDto } from './dto/search-publishers.dto';

jest.mock('./search-delivery.service');

describe('SearchDeliveryController', () => {
  let searchDeliveryController: SearchDeliveryController;
  let searchDeliveryService: jest.Mocked<SearchDeliveryService>;

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

  describe('getTrendingTopics', () => {
    let trendingTopics: TrendingTopicsDBResponseDto;
    const topicId = 'Sports';
    const language = 'en';
    const topics: TrendingTopicsDBResponseDto =
      {} as TrendingTopicsDBResponseDto;

    beforeEach(async () => {
      searchDeliveryService.getTrendingTopics.mockResolvedValue(topics);
      trendingTopics = await searchDeliveryController.getTrendingTopics(
        language,
        topicId,
      );
    });

    it('should call searchDeliveryService.getTrendingTopics', () => {
      expect(searchDeliveryService.getTrendingTopics).toHaveBeenCalledWith(
        language,
        topicId,
        1,
        10,
        'date',
      );
    });

    it('should return trending topics', () => {
      expect(trendingTopics).toEqual(topics);
    });

    it('should throw an error if searchDeliveryService.getTrendingTopics throws an error', async () => {
      searchDeliveryService.getTrendingTopics.mockRejectedValue(new Error());
      await expect(
        searchDeliveryController.getTrendingTopics(),
      ).rejects.toThrow(Error);
    });
  });

  describe('searchArticles', () => {
    let searchArticles: SearchArticlesDto[];
    const articles: SearchArticlesDto[] = [];
    const query = 'query';
    const language = 'en';

    beforeEach(async () => {
      searchDeliveryService.searchArticles.mockResolvedValue(articles);
      searchArticles = await searchDeliveryController.searchArticles(
        query,
        language,
      );
    });

    it('should call searchDeliveryService.searchArticles', () => {
      expect(searchDeliveryService.searchArticles).toHaveBeenCalledWith(
        query,
        language,
      );
    });

    it('should return search articles', () => {
      expect(searchArticles).toEqual(articles);
    });

    it('should throw an error if searchDeliveryService.searchArticles throws an error', async () => {
      searchDeliveryService.searchArticles.mockRejectedValue(new Error());
      await expect(
        searchDeliveryController.searchArticles(query, language),
      ).rejects.toThrow(Error);
    });
  });

  describe('searchPublishers', () => {
    let searchPublishers: SearchPublishersDto[];
    const publishers: SearchPublishersDto[] = [];
    const query = 'query';
    const country = 'country';
    const language = 'en';
    const category = 'category';

    beforeEach(async () => {
      searchDeliveryService.searchPublishers.mockResolvedValue(publishers);
      searchPublishers = await searchDeliveryController.searchPublishers(
        query,
        country,
        language,
        category,
      );
    });

    it('should call searchDeliveryService.searchPublishers', () => {
      expect(searchDeliveryService.searchPublishers).toHaveBeenCalledWith(
        query,
        country,
        language,
        category,
      );
    });

    it('should return search publishers', () => {
      expect(searchPublishers).toEqual(publishers);
    });

    it('should throw an error if searchDeliveryService.searchPublishers throws an error', async () => {
      searchDeliveryService.searchPublishers.mockRejectedValue(new Error());
      await expect(
        searchDeliveryController.searchPublishers(
          query,
          country,
          language,
          category,
        ),
      ).rejects.toThrow(Error);
    });
  });
});
