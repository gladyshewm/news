import { Module } from '@nestjs/common';
import { DataFetcherController } from './data-fetcher.controller';
import { DataFetcherService } from './data-fetcher.service';
import { DbModule } from '@app/db';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { NewsApiModule } from '../news-api/news-api.module';
import { RmqModule } from '@app/rmq';
import { DATA_FETCHER_SERVICE } from '../constants/services';
import { SharedModule } from '@app/shared';

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
        RMQ_URI: Joi.string().required(),
        RMQ_SEARCH_DELIVERY_QUEUE: Joi.string().required(),
        RMQ_DATA_FETCHER_QUEUE: Joi.string().required(),
        API_KEY: Joi.string().required(),
        API_HOST: Joi.string().required(),
      }),
      envFilePath: './apps/data-fetcher/.env',
    }),
    DbModule,
    SharedModule,
    RmqModule.register({ name: DATA_FETCHER_SERVICE }),
    NewsApiModule,
  ],
  controllers: [DataFetcherController],
  providers: [DataFetcherService],
  exports: [DataFetcherService],
})
export class DataFetcherModule {}
