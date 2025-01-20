import { NestFactory } from '@nestjs/core';
import { AnalyticsModule } from './analytics.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AnalyticsModule);

  const configService = app.get(ConfigService);
  await app.listen(configService.get('PORT') ?? 3002);
}
bootstrap();
