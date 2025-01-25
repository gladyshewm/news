import { NestFactory } from '@nestjs/core';
import { DataFetcherModule } from './data-fetcher/data-fetcher.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RmqService } from '@app/rmq';
import { DATA_FETCHER_SERVICE } from './constants/services.constant';

async function bootstrap() {
  const app = await NestFactory.create(DataFetcherModule);
  app.useGlobalPipes(new ValidationPipe());

  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice(rmqService.getOptions(DATA_FETCHER_SERVICE));

  await app.startAllMicroservices();

  const configService = app.get(ConfigService);
  await app.listen(configService.get('PORT') ?? 3000);
}
bootstrap();
