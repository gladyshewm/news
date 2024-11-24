import { Test, TestingModule } from '@nestjs/testing';
import { DataFetcherController } from './data-fetcher.controller';
import { DataFetcherService } from './data-fetcher.service';

describe('DataFetcherController', () => {
  let dataFetcherController: DataFetcherController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [DataFetcherController],
      providers: [DataFetcherService],
    }).compile();

    dataFetcherController = app.get<DataFetcherController>(DataFetcherController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(dataFetcherController.getHello()).toBe('Hello World!');
    });
  });
});
