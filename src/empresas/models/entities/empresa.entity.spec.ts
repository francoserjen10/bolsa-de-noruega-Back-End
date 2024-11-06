import { Empresa } from './empresa.entity';

describe('Empresa', () => {
  it('should be defined', () => {
    expect(new Empresa()).toBeDefined();
  });
});
