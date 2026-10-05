import { describe, expect, it } from '@jest/globals';

import { paddingOf } from '../../utils';

describe('paddingOf', () => {
  it('prefers the specific edge', () => {
    expect(
      paddingOf({ paddingTop: 4, paddingVertical: 8, padding: 12 }, 'Top')
    ).toBe(4);
  });

  it('falls back to vertical, then all', () => {
    expect(paddingOf({ paddingVertical: 8, padding: 12 }, 'Bottom')).toBe(8);
    expect(paddingOf({ padding: 12 }, 'Bottom')).toBe(12);
  });

  it('is 0 without padding', () => {
    expect(paddingOf({}, 'Top')).toBe(0);
  });

  it('ignores percentages', () => {
    expect(paddingOf({ paddingTop: '10%' }, 'Top')).toBe(0);
  });
});
