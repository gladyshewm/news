import { Module } from '@nestjs/common';
import { SearchDeliveryController } from './search-delivery.controller';
import { SearchDeliveryService } from './search-delivery.service';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { RmqModule } from '@app/rmq';
import {
  DATA_FETCHER_SERVICE,
  SEARCH_DELIVERY_SERVICE,
} from './constants/services';
import { DbModule } from '@app/db';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrendingTopic } from './entities/trending-topic.entity';
import { Publisher } from './entities/publisher.entity';
import { RedisModule } from '@app/redis';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().required().default(3001),
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),
        RMQ_URI: Joi.string().required(),
        RMQ_SEARCH_DELIVERY_QUEUE: Joi.string().required(),
        RMQ_DATA_FETCHER_QUEUE: Joi.string().required(),
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().required(),
      }),
      envFilePath: './apps/search-delivery/.env',
    }),
    RmqModule.register({ name: SEARCH_DELIVERY_SERVICE }),
    RmqModule.register({ name: DATA_FETCHER_SERVICE }),
    DbModule,
    TypeOrmModule.forFeature([TrendingTopic, Publisher]),
    RedisModule,
  ],
  controllers: [SearchDeliveryController],
  providers: [SearchDeliveryService],
})
export class SearchDeliveryModule {}
