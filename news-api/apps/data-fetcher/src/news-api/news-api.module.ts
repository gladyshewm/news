import { Module } from '@nestjs/common';
import { NewsApiService } from './news-api.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';

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
  ],
  controllers: [],
  providers: [NewsApiService],
  exports: [NewsApiService],
})
export class NewsApiModule {}
