import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateNewsClickDto } from './dto/create-news-click.dto';
import {
  AuthorStat,
  AuthorStatsDto,
  NewsClick,
  NewsClickDto,
  TrendingTopic,
} from '@app/shared';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FrequentlyReadNewsDto } from './dto/frequently-read-news.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(NewsClick)
    private newsClickRepository: Repository<NewsClick>,
    @InjectRepository(TrendingTopic)
    private trendingTopicRepository: Repository<TrendingTopic>,
    @InjectRepository(AuthorStat)
    private authorStatRepository: Repository<AuthorStat>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async registerClick(
    createNewsClickDto: CreateNewsClickDto,
  ): Promise<NewsClickDto> {
    try {
      const newsClick = this.newsClickRepository.create(createNewsClickDto);
      await this.newsClickRepository.save(newsClick);

      const trendingTopic = await this.trendingTopicRepository.findOne({
        where: { id: createNewsClickDto.trendingTopicId },
        relations: ['publisher'],
      });

      if (!trendingTopic || !trendingTopic.publisher) {
        throw new InternalServerErrorException(
          'Trending topic or publisher not found',
        );
      }

      const publisherId = trendingTopic.publisher.id;
      const authorStat = await this.authorStatRepository.findOne({
        where: { publisherId },
      });

      if (authorStat) {
        authorStat.totalClicks += 1;
        authorStat.lastUpdated = new Date();
        await this.authorStatRepository.save(authorStat);
      } else {
        const newStat = this.authorStatRepository.create({
          publisherId,
          totalArticles: 1,
          totalClicks: 1,
          lastUpdated: new Date(),
        });
        await this.authorStatRepository.save(newStat);
      }

      return newsClick;
    } catch (error) {
      this.logger.error(`Failed to register click: ${error.message}`);
      throw new Error(`Failed to register click: ${error.message}`);
    }
  }

  // TODO: cache
  async frequentlyReadNews(limit: number): Promise<FrequentlyReadNewsDto[]> {
    const cacheKey = `frequently_read_news_${limit}`;
    const cached =
      await this.cacheManager.get<FrequentlyReadNewsDto[]>(cacheKey);

    if (cached) return cached;

    try {
      const { entities: news, raw } = await this.trendingTopicRepository
        .createQueryBuilder('trending_topic')
        .leftJoinAndSelect('trending_topic.newsClicks', 'news_click')
        .select([
          'trending_topic',
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
          ].join(', '),
        )
        .orderBy('clicks_count', 'DESC')
        .limit(limit)
        .getRawAndEntities();

      const frequentlyReadNews = news.map((entity, idx) => ({
        ...entity,
        clicksCount: parseInt(raw[idx].clicks_count),
      }));

      await this.cacheManager.set(cacheKey, frequentlyReadNews, 1000 * 60 * 15);

      return frequentlyReadNews;
    } catch (error) {
      this.logger.error(
        `Failed to fetch frequently read news: ${error.message}`,
      );
      throw new InternalServerErrorException(
        `Failed to fetch frequently read news: ${error.message}`,
      );
    }
  }

  async getTopAuthors(limit: number): Promise<AuthorStatsDto[]> {
    const cacheKey = `top_authors_${limit}`;
    const cached = await this.cacheManager.get<AuthorStatsDto[]>(cacheKey);

    if (cached) return cached;

    try {
      const { entities: authors } = await this.authorStatRepository
        .createQueryBuilder('author_stat')
        .leftJoinAndSelect('author_stat.publisher', 'publisher')
        .select([
          'author_stat',
          'publisher.id',
          'publisher.name',
          'publisher.url',
          'publisher.favicon',
        ])
        .groupBy('author_stat.publisherId')
        .addGroupBy(
          [
            'author_stat.id',
            'author_stat.totalArticles',
            'author_stat.totalClicks',
            'author_stat.lastUpdated',
            'publisher.id',
            'publisher.name',
            'publisher.url',
            'publisher.favicon',
          ].join(', '),
        )
        .orderBy('author_stat.totalClicks', 'DESC')
        .limit(limit)
        .getRawAndEntities();

      // const topAuthors = authors.map((author) => ({
      //   ...author,
      //   publisher: author.publisher,
      // }));

      await this.cacheManager.set(cacheKey, authors, 1000 * 60 * 15);

      return authors;
    } catch (error) {
      this.logger.error(`Failed to fetch top authors: ${error.message}`);
      throw new InternalServerErrorException(
        `Failed to fetch top authors: ${error.message}`,
      );
    }
  }
}
