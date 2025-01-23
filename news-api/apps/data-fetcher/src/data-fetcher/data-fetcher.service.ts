import { Injectable, Logger } from '@nestjs/common';
import { Publisher, TrendingTopic, TrendingTopicDto } from '@app/shared';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class DataFetcherService {
  private readonly logger = new Logger(DataFetcherService.name);

  constructor(
    @InjectRepository(TrendingTopic)
    private readonly trendingTopicRepo: Repository<TrendingTopic>,
    @InjectRepository(Publisher)
    private readonly publisherRepo: Repository<Publisher>,
  ) {}

  async saveTopics(topics: TrendingTopicDto[]): Promise<void> {
    try {
      for (const topic of topics) {
        const existingTopic = await this.trendingTopicRepo.findOne({
          where: {
            title: topic.title,
            url: topic.url,
            date: topic.date,
          },
        });

        if (existingTopic) continue;

        let publisher = await this.publisherRepo.findOne({
          where: {
            name: topic.publisher.name,
            url: topic.publisher.url,
          },
        });

        if (!publisher) {
          publisher = this.publisherRepo.create(topic.publisher);
          await this.publisherRepo.save(publisher);
        }

        const newTopic = this.trendingTopicRepo.create({
          ...topic,
          publisher: publisher,
        });

        await this.trendingTopicRepo.save(newTopic);
      }
    } catch (error) {
      this.logger.error(`Failed to save topics: ${error.message}`);
      throw new Error(`Failed to save topics: ${error.message}`);
    }
  }
}
