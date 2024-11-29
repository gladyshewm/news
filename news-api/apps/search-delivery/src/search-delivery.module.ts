import { Module } from '@nestjs/common';
import { SearchDeliveryController } from './search-delivery.controller';
import { SearchDeliveryService } from './search-delivery.service';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { RmqModule } from '@app/rmq';
import { SEARCH_DELIVERY_SERVICE } from './constants/services';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().required().default(3001),
        RMQ_URI: Joi.string().required(),
        RMQ_SEARCH_DELIVERY_QUEUE: Joi.string().required(),
        RMQ_DATA_FETCHER_QUEUE: Joi.string().required(),
      }),
      envFilePath: './apps/search-delivery/.env',
    }),
    RmqModule.register({ name: SEARCH_DELIVERY_SERVICE }),
  ],
  controllers: [SearchDeliveryController],
  providers: [SearchDeliveryService],
})
export class SearchDeliveryModule {}
