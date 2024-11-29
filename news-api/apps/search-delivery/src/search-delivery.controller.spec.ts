import { Test, TestingModule } from '@nestjs/testing';
import { SearchDeliveryController } from './search-delivery.controller';
import { SearchDeliveryService } from './search-delivery.service';

describe('SearchDeliveryController', () => {
  let searchDeliveryController: SearchDeliveryController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [SearchDeliveryController],
      providers: [SearchDeliveryService],
    }).compile();

    searchDeliveryController = app.get<SearchDeliveryController>(SearchDeliveryController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(searchDeliveryController.getHello()).toBe('Hello World!');
    });
  });
});
