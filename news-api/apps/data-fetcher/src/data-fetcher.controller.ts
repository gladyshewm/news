import { Controller, Get } from '@nestjs/common';
import { DataFetcherService } from './data-fetcher.service';

@Controller()
export class DataFetcherController {
  constructor(private readonly dataFetcherService: DataFetcherService) {}

  @Get()
  getHello(): string {
    return this.dataFetcherService.getHello();
  }
}
