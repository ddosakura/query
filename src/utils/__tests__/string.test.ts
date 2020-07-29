import { toHump, toLine } from '../string';

describe('FSM', () => {
  test('toHump', () => {
    expect(toHump('a_b2_345_c2345')).toBe('aB2345C2345');
  })
  test('toLine', () => {
    expect(toLine('aBdaNf')).toBe('a_bda_nf');
  })
});
