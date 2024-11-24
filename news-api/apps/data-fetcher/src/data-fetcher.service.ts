import { Injectable } from '@nestjs/common';

@Injectable()
export class DataFetcherService {
  getHello(): string {
    return 'Hello World1222!';
  }
}
