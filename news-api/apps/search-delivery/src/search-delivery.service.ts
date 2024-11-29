import { Injectable } from '@nestjs/common';

@Injectable()
export class SearchDeliveryService {
  getHello(): string {
    return 'Hello World!';
  }
}
