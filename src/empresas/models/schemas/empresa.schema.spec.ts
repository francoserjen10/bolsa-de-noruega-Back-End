import { Empresa } from './empresa.schema';

describe('Empresa', () => {
  it('should be defined', () => {
    expect(new Empresa()).toBeDefined();
  });
});
