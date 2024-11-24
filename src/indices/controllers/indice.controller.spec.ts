import { Test, TestingModule } from '@nestjs/testing';
import { IndiceController } from './indice.controller';

describe('IndiceController', () => {
  let controller: IndiceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IndiceController],
    }).compile();

    controller = module.get<IndiceController>(IndiceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
