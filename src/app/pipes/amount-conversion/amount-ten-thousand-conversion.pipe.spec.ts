import { AmountTenThousandConversionPipe } from './amount-ten-thousand-conversion.pipe';

describe('AmountTenThousandConversionPipe', () => {
  it('create an instance', () => {
    const pipe = new AmountTenThousandConversionPipe();
    expect(pipe).toBeTruthy();
  });
});
