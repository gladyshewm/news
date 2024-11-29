import { Module } from '@nestjs/common';
import { DataFetcherController } from './data-fetcher.controller';
import { DataFetcherService } from './data-fetcher.service';
import { DbModule } from '@app/db';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrendingTopic } from './entities/trending-topic.entity';
import { NewsApiModule } from '../news-api/news-api.module';
import { Publisher } from './entities/publisher.entity';
import { TrendingTopicRepository } from './trending-topic.repository';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().required().default(3000),
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),
        API_KEY: Joi.string().required(),
        API_HOST: Joi.string().required(),
      }),
      envFilePath: './apps/data-fetcher/.env',
    }),
    DbModule,
    TypeOrmModule.forFeature([TrendingTopic, Publisher]),
    NewsApiModule,
  ],
  controllers: [DataFetcherController],
  providers: [DataFetcherService, TrendingTopicRepository],
})
export class DataFetcherModule {}
