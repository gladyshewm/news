import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { DbModule } from '@app/db';
import { SharedModule } from '@app/shared';
import { RmqModule } from '@app/rmq';
import {
  ANALYTICS_SERVICE,
  SEARCH_DELIVERY_SERVICE,
} from './constants/services.constant';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().required().default(3002),
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().required(),
        RMQ_URI: Joi.string().required(),
        RMQ_SEARCH_DELIVERY_QUEUE: Joi.string().required(),
        RMQ_ANALYTICS_QUEUE: Joi.string().required(),
      }),
    }),
    DbModule,
    SharedModule,
    RmqModule.register({ name: ANALYTICS_SERVICE }),
    RmqModule.register({ name: SEARCH_DELIVERY_SERVICE }),
    ScheduleModule.forRoot(),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
