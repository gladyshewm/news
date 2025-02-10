import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Repository } from 'typeorm';
import { TrendingTopicsDBResponseDto } from './dto/trending-topics-db-res.dto';
import {
  ANALYTICS_SERVICE,
  DATA_FETCHER_SERVICE,
} from './constants/services.constant';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import {
  AuthorStatsDto,
  CreateNewsClickDto,
  FrequentlyReadNewsDto,
  Publisher,
  SearchArticlesDto,
  ServiceResponseDto,
  TrendingTopic,
} from '@app/shared';
import { CACHE_KEYS } from './constants/cache-keys.constant';
import { TrendingTopicsQueryDto } from './dto/trending-topics-query.dto';
import { LatestNewsQueryDto } from './dto/latest-news-query.dto';
import { SearchPublishersQueryDto } from './dto/search-publishers-query.dto';
import { PublishersDBResponseDto } from './dto/publishers-db-res.dto';
import { SearchArticlesQueryDto } from './dto/search-articles-query.dto';

@Injectable()
export class SearchDeliveryService {
  private readonly logger = new Logger(SearchDeliveryService.name);

  constructor(
    @InjectRepository(TrendingTopic)
    private readonly trendingTopicRepo: Repository<TrendingTopic>,
    @InjectRepository(Publisher)
    private readonly publisherRepo: Repository<Publisher>,
    @Inject(DATA_FETCHER_SERVICE)
    private readonly dataFetcherClient: ClientProxy,
    @Inject(ANALYTICS_SERVICE)
    private readonly analyticsClient: ClientProxy,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private async getCacheData<T>(
    cacheKey: string,
    fallBackValue: T = null as T,
  ): Promise<T> {
    try {
      return (await this.cacheManager.get(cacheKey)) || fallBackValue;
    } catch (error) {
      this.logger.warn(`Cache error: ${error.message}`);
      return fallBackValue;
    }
  }

  async trendingTopics(
    query: TrendingTopicsQueryDto,
  ): Promise<TrendingTopicsDBResponseDto> {
    const { language, topic, page, limit, sort, country, publisher } = query;

    const params = new URLSearchParams({
      language: language || '',
      page: page.toString(),
      limit: limit.toString(),
      sort: sort || '',
      country: country || '',
    });
    topic?.forEach((t) => params.append('topic', t));
    publisher?.forEach((p) => params.append('publisher', p));

    const cacheKey = CACHE_KEYS.TRENDING_TOPICS(
      language,
      params.getAll('topic').join(','),
      page,
      limit,
      sort,
      country,
      params.getAll('publisher').join(','),
    );

    const cachedResponse =
      await this.getCacheData<TrendingTopicsDBResponseDto>(cacheKey);
    if (cachedResponse) return cachedResponse;

    try {
      const whereCondition: any = {};
      if (topic) whereCondition.topicId = In(topic);
      if (country) whereCondition.country = country;
      if (publisher) whereCondition.publisher = { name: In(publisher) };

      // const [topics, count] = await this.trendingTopicRepo.findAndCount({
      //   where: whereCondition,
      //   order: { [sort]: 'DESC' },
      //   skip: (page - 1) * limit,
      //   take: limit,
      //   relations: ['publisher', 'newsClicks'],
      // });
      const queryBuilder = this.trendingTopicRepo
        .createQueryBuilder('trending_topic')
        .leftJoinAndSelect('trending_topic.newsClicks', 'news_click')
        .leftJoinAndSelect('trending_topic.publisher', 'publisher')
        .select([
          'trending_topic',
          'publisher.id',
          'publisher.name',
          'publisher.url',
          'publisher.favicon',
          'COUNT(DISTINCT news_click.id) as clicks_count',
        ])
        .groupBy('trending_topic.id')
        .addGroupBy(
          [
            'trending_topic.topicId',
            'trending_topic.title',
            'trending_topic.url',
            'trending_topic.excerpt',
            'trending_topic.thumbnail',
            'trending_topic.language',
            'trending_topic.country',
            'trending_topic.contentLength',
            'trending_topic.authors',
            'trending_topic.keywords',
            'trending_topic.date',
            'publisher.id',
            'publisher.name',
            'publisher.url',
            'publisher.favicon',
          ].join(', '),
        );

      if (topic)
        queryBuilder.andWhere('trending_topic.topicId IN (:...topics)', {
          topics: topic,
        });
      if (country)
        queryBuilder.andWhere('trending_topic.country = :country', { country });
      if (publisher)
        queryBuilder.andWhere('publisher.name IN (:...publishers)', {
          publishers: publisher,
        });

      queryBuilder
        .orderBy(
          sort === 'popularity' ? 'clicks_count' : 'trending_topic.date',
          'DESC',
        )
        .skip((page - 1) * limit)
        .limit(limit);

      const { entities: topics, raw } = await queryBuilder.getRawAndEntities();

      const result = {
        data: topics,
        total: raw.length,
        page,
        pages: Math.ceil(raw.length / limit),
      };

      await this.cacheManager.set(cacheKey, result, 1000 * 60 * 15);

      return result;
    } catch (error) {
      this.logger.error(`Failed to fetch trending topics: ${error.message}`);
      throw new Error(`Failed to fetch trending topics: ${error.message}`);
    }
  }

  async latestNews(
    query: LatestNewsQueryDto,
  ): Promise<TrendingTopicsDBResponseDto> {
    const { language, limit, topic } = query;

    const cacheKey = CACHE_KEYS.LATEST_NEWS(language, limit, topic);
    const cachedResponse =
      await this.getCacheData<TrendingTopicsDBResponseDto>(cacheKey);
    if (cachedResponse) return cachedResponse;

    try {
      const whereCondition: any = { language };
      if (topic) whereCondition.topicId = topic;

      const [latestNews, total] = await this.trendingTopicRepo.findAndCount({
        where: whereCondition,
        order: { date: 'DESC' },
        skip: 0,
        take: limit,
        relations: ['publisher'],
      });

      const result = {
        data: latestNews,
        total,
        page: 1,
        pages: Math.ceil(total / limit),
      };

      await this.cacheManager.set(cacheKey, result, 1000 * 60 * 15);

      return result;
    } catch (error) {
      this.logger.error(`Failed to fetch latest news: ${error.message}`);
      throw new Error(`Failed to fetch latest news: ${error.message}`);
    }
  }

  async searchArticles(
    query: SearchArticlesQueryDto,
  ): Promise<SearchArticlesDto[]> {
    const { articleQuery, language } = query;
    const cacheKey = CACHE_KEYS.SEARCH_ARTICLES(articleQuery, language);
    const cachedResponse =
      await this.getCacheData<SearchArticlesDto[]>(cacheKey);
    if (cachedResponse) return cachedResponse;

    try {
      const articles = await lastValueFrom(
        this.dataFetcherClient.send<ServiceResponseDto<SearchArticlesDto[]>>(
          'search_articles',
          {
            query,
            language,
          },
        ),
      );

      await this.cacheManager.set(cacheKey, articles.data, 1000 * 60 * 15);

      if (articles.success === false) {
        this.logger.error(`Failed to fetch search articles: ${articles.error}`);
        return [];
      }

      return articles.data;
    } catch (error) {
      this.logger.error(`Failed to fetch search articles: ${error.message}`);
      throw new Error(`Failed to fetch search articles: ${error.message}`);
    }
  }

  // async searchPublishers(
  //   query: string,
  //   country: string,
  //   language: string,
  //   category: string,
  // ): Promise<SearchPublishersDto[]> {
  //   const cacheKey = CACHE_KEYS.SEARCH_PUBLISHERS(
  //     query,
  //     language,
  //     country,
  //     category,
  //   );

  //   const cachedPublishers =
  //     await this.getCacheData<SearchPublishersDto[]>(cacheKey);
  //   if (cachedPublishers) return cachedPublishers;

  //   try {
  //     const publishers = await lastValueFrom(
  //       this.dataFetcherClient.send<ServiceResponseDto<SearchPublishersDto[]>>(
  //         'search_publishers',
  //         {
  //           query,
  //           country,
  //           language,
  //           category,
  //         },
  //       ),
  //     );

  //     await this.cacheManager.set(cacheKey, publishers.data, 1000 * 60 * 15);

  //     if (publishers.success === false) {
  //       this.logger.error(
  //         `Failed to fetch search publishers: ${publishers.error}`,
  //       );
  //       return [];
  //     }

  //     return publishers.data;
  //   } catch (error) {
  //     this.logger.error(`Failed to fetch search publishers: ${error.message}`);
  //     throw new Error(`Failed to fetch search publishers: ${error.message}`);
  //   }
  // }

  async searchPublishers(
    query: SearchPublishersQueryDto,
  ): Promise<PublishersDBResponseDto> {
    const { name } = query;
    const cacheKey = CACHE_KEYS.SEARCH_PUBLISHERS(name);

    const cachedPublishers =
      await this.getCacheData<PublishersDBResponseDto>(cacheKey);
    if (cachedPublishers) return cachedPublishers;

    try {
      const [publishers, total] = await this.publisherRepo.findAndCount({
        where: { name: ILike(`%${name}%`) },
        take: 10,
        relations: ['authorStats'],
      });

      const result = {
        data: publishers,
        total,
        page: 1,
        pages: Math.ceil(total / 10),
      };

      await this.cacheManager.set(cacheKey, result, 1000 * 60 * 15);

      return result;
    } catch (error) {
      this.logger.error(`Failed to fetch search publishers: ${error.message}`);
      throw new Error(`Failed to fetch search publishers: ${error.message}`);
    }
  }

  async registerClick(createNewsClickDto: CreateNewsClickDto) {
    try {
      await lastValueFrom(
        this.analyticsClient.emit('news_click', createNewsClickDto),
      );
    } catch (error) {
      this.logger.error(`Failed to register click: ${error.message}`);
      throw new Error(`Failed to register click: ${error.message}`);
    }
  }

  async frequentlyReadNews(limit: number): Promise<FrequentlyReadNewsDto[]> {
    const cacheKey = CACHE_KEYS.FREQUENTLY_READ_NEWS(limit);
    const cachedFrequentlyReadNews =
      await this.getCacheData<FrequentlyReadNewsDto[]>(cacheKey);
    if (cachedFrequentlyReadNews) return cachedFrequentlyReadNews;

    try {
      const frequentlyReadNews = await lastValueFrom(
        this.analyticsClient.send<ServiceResponseDto<FrequentlyReadNewsDto[]>>(
          'frequently_read_news',
          { limit },
        ),
      );

      await this.cacheManager.set(
        cacheKey,
        frequentlyReadNews.data,
        1000 * 60 * 15,
      );

      if (frequentlyReadNews.success === false) {
        this.logger.error(
          `Failed to fetch frequently read news: ${frequentlyReadNews.error}`,
        );
        return [];
      }

      return frequentlyReadNews.data;
    } catch (error) {
      this.logger.error(
        `Failed to fetch frequently read news: ${error.message}`,
      );
      throw new Error(`Failed to fetch frequently read news: ${error.message}`);
    }
  }

  async topAuthors(limit: number): Promise<AuthorStatsDto[]> {
    const cacheKey = CACHE_KEYS.TOP_AUTHORS(limit);
    const cachedAuthors = await this.getCacheData<AuthorStatsDto[]>(cacheKey);
    if (cachedAuthors) return cachedAuthors;

    try {
      const authors = await lastValueFrom(
        this.analyticsClient.send<ServiceResponseDto<AuthorStatsDto[]>>(
          'top_authors',
          { limit },
        ),
      );

      await this.cacheManager.set(cacheKey, authors.data, 1000 * 60 * 15);

      if (authors.success === false) {
        this.logger.error(`Failed to fetch top authors: ${authors.error}`);
        return [];
      }

      return authors.data;
    } catch (error) {
      this.logger.error(`Failed to fetch top authors: ${error.message}`);
      throw new Error(`Failed to fetch top authors: ${error.message}`);
    }
  }
}
