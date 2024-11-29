import { Controller, Get } from '@nestjs/common';
import { SearchDeliveryService } from './search-delivery.service';

@Controller()
export class SearchDeliveryController {
  constructor(private readonly searchDeliveryService: SearchDeliveryService) {}

  @Get()
  getHello(): string {
    return this.searchDeliveryService.getHello();
  }
}
