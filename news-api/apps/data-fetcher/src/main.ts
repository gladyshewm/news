import { NestFactory } from '@nestjs/core';
import { DataFetcherModule } from './data-fetcher.module';

async function bootstrap() {
  const app = await NestFactory.create(DataFetcherModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
