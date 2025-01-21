import { NestFactory } from '@nestjs/core';
import { AnalyticsModule } from './analytics.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { RmqService } from '@app/rmq';
import { ANALYTICS_SERVICE } from './constants/services';

async function bootstrap() {
  const app = await NestFactory.create(AnalyticsModule);
  app.useGlobalPipes(new ValidationPipe());

  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice(rmqService.getOptions(ANALYTICS_SERVICE));

  await app.startAllMicroservices();

  const configService = app.get(ConfigService);
  await app.listen(configService.get('PORT') ?? 3002);
}
bootstrap();
