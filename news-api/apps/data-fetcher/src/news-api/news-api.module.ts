import { forwardRef, Module } from '@nestjs/common';
import { NewsApiService } from './news-api.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RmqModule } from '@app/rmq';
import { SEARCH_DELIVERY_SERVICE } from '../constants/services.constant';
import { ScheduleModule } from '@nestjs/schedule';
import { DataFetcherModule } from '../data-fetcher/data-fetcher.module';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        baseURL: configService.get<string>('API_URL'),
        headers: {
          'x-rapidapi-key': configService.get<string>('API_KEY'),
          'x-rapidapi-host': configService.get<string>('API_HOST'),
        },
      }),
      inject: [ConfigService],
    }),
    RmqModule.register({ name: SEARCH_DELIVERY_SERVICE }),
    ScheduleModule.forRoot(),
    forwardRef(() => DataFetcherModule),
  ],
  controllers: [],
  providers: [NewsApiService],
  exports: [NewsApiService],
})
export class NewsApiModule {}
