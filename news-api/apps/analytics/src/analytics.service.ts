import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import {
  AuthorStat,
  AuthorStatsDto,
  CreateNewsClickDto,
  FrequentlyReadNewsDto,
  NewsClick,
  Publisher,
  TrendingTopic,
} from '@app/shared';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RmqContext } from '@nestjs/microservices';
import { RmqService } from '@app/rmq';
import { FrequentlyReadNewsPayload } from './dto/frequently-read-news-payload.dto';
import { TopAuthorsPayload } from './dto/top-authors-payload.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AnalyticsService implements OnModuleInit {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(NewsClick)
    private newsClickRepository: Repository<NewsClick>,
    @InjectRepository(TrendingTopic)
    private trendingTopicRepository: Repository<TrendingTopic>,
    @InjectRepository(AuthorStat)
    private authorStatRepository: Repository<AuthorStat>,
    @InjectRepository(Publisher)
    private publisherRepository: Repository<Publisher>,
    private readonly rmqService: RmqService,
  ) {}

  async onModuleInit() {
    await this.initializeAuthorStats();
  }

  async initializeAuthorStats(): Promise<void> {
    this.logger.log('Starting initialization of author_stats...');

    try {
      const publishers = await this.publisherRepository.find();
      const existingStats = await this.authorStatRepository.find();

      const existingPublisherIds = new Set(
        existingStats.map((stat) => stat.publisherId),
      );

      const newAuthorStats = publishers
        .filter((publisher) => !existingPublisherIds.has(publisher.id))
        .map((publisher) => {
          return this.authorStatRepository.create({
            publisherId: publisher.id,
            totalArticles: 1, // CRON обновит позже
            totalClicks: 0,
            lastUpdated: new Date(),
          });
        });

      if (newAuthorStats.length > 0) {
        await this.authorStatRepository.save(newAuthorStats);
        this.logger.log(`Inserted ${newAuthorStats.length} new author stats.`);
      } else {
        this.logger.log('No new author stats to insert.');
      }
    } catch (error) {
      this.logger.error(`Failed to initialize author stats: ${error.message}`);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async updateTotalArticles(): Promise<void> {
    this.logger.log('Starting totalArticles update...');

    // select count(*) from trending_topic tt left join publisher p on tt."publisherId" = p.id where p.name = 'Forbes';
    try {
      const authors = await this.authorStatRepository.find();

      for (const author of authors) {
        const publisherId = author.publisherId;

        const totalArticles = await this.trendingTopicRepository.count({
          where: {
            publisher: { id: publisherId },
          },
        });

        author.totalArticles = totalArticles;
        author.lastUpdated = new Date();

        await this.authorStatRepository.save(author);
        this.logger.log(
          `Updated articles for publisherId ${publisherId}: ${totalArticles}`,
        );
      }
      this.logger.log('Total articles successfully updated');
    } catch (error) {
      this.logger.error(`Failed to update totalArticles: ${error.message}`);
    }
  }

  async registerClick(
    createNewsClickDto: CreateNewsClickDto,
    context: RmqContext,
  ): Promise<void> {
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
    } catch (error) {
      this.logger.error(`Failed to register click: ${error.message}`);
      throw new Error(`Failed to register click: ${error.message}`);
    } finally {
      this.rmqService.ack(context);
    }
  }

  async getFrequentlyReadNews(limit: number): Promise<FrequentlyReadNewsDto[]> {
    try {
      const { entities: news, raw } = await this.trendingTopicRepository
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
        )
        .orderBy('clicks_count', 'DESC')
        .limit(limit)
        .getRawAndEntities();

      const frequentlyReadNews = news.map((entity, idx) => ({
        ...entity,
        clicksCount: parseInt(raw[idx].clicks_count),
      }));

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

  async frequentlyReadNews(
    payload: FrequentlyReadNewsPayload,
    context: RmqContext,
  ): Promise<FrequentlyReadNewsDto[]> {
    const { limit } = payload;
    try {
      const frequentlyReadNews = await this.getFrequentlyReadNews(limit);
      return frequentlyReadNews;
    } catch (error) {
      this.logger.error(
        `Failed to fetch frequently read news: ${error.message}`,
      );
      throw new Error(`Failed to fetch frequently read news: ${error.message}`);
    } finally {
      this.rmqService.ack(context);
    }
  }

  async getTopAuthors(limit: number): Promise<AuthorStatsDto[]> {
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

      return authors;
    } catch (error) {
      this.logger.error(`Failed to fetch top authors: ${error.message}`);
      throw new InternalServerErrorException(
        `Failed to fetch top authors: ${error.message}`,
      );
    }
  }

  async topAuthors(payload: TopAuthorsPayload, context: RmqContext) {
    const { limit } = payload;
    try {
      const authors = await this.getTopAuthors(limit);
      return authors;
    } catch (error) {
      this.logger.error(`Failed to fetch top authors: ${error.message}`);
      throw new Error(`Failed to fetch top authors: ${error.message}`);
    } finally {
      this.rmqService.ack(context);
    }
  }
}
