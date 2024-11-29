import { NestFactory } from '@nestjs/core';
import { SearchDeliveryModule } from './search-delivery.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RmqService } from '@app/rmq';
import { SEARCH_DELIVERY_SERVICE } from './constants/services';

async function bootstrap() {
  const app = await NestFactory.create(SearchDeliveryModule);
  app.useGlobalPipes(new ValidationPipe());

  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice(rmqService.getOptions(SEARCH_DELIVERY_SERVICE));

  await app.startAllMicroservices();

  const configService = app.get(ConfigService);
  await app.listen(configService.get('PORT') ?? 3001);
}
bootstrap();
