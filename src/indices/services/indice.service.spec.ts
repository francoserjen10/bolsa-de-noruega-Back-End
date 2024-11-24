import { Test, TestingModule } from '@nestjs/testing';
import { IndiceService } from './indice.service';

describe('IndiceService', () => {
  let service: IndiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IndiceService],
    }).compile();

    service = module.get<IndiceService>(IndiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
