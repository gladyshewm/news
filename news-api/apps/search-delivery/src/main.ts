import { NestFactory } from '@nestjs/core';
import { SearchDeliveryModule } from './search-delivery.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RmqService } from '@app/rmq';
import { SEARCH_DELIVERY_SERVICE } from './constants/services';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

async function bootstrap() {
  const app = await NestFactory.create(SearchDeliveryModule);
  app.useGlobalPipes(new ValidationPipe());

  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice(rmqService.getOptions(SEARCH_DELIVERY_SERVICE));

  const configService = app.get(ConfigService);

  const corsOptions: CorsOptions = {
    origin: configService.get<string>('CLIENT_URL') || 'http://localhost:5000',
    optionsSuccessStatus: 200,
    credentials: true,
  };
  app.enableCors(corsOptions);

  await app.startAllMicroservices();

  await app.listen(configService.get('PORT') ?? 3001);
}
bootstrap();
