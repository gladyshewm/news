import { Module } from '@nestjs/common';
import { DataFetcherController } from './data-fetcher.controller';
import { DataFetcherService } from './data-fetcher.service';

@Module({
  imports: [],
  controllers: [DataFetcherController],
  providers: [DataFetcherService],
})
export class DataFetcherModule {}
