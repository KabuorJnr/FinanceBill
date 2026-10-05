import { describe, expect, it } from '@jest/globals';
import { initialNavigation, navigate } from '../../utils';

describe('initialNavigation', () => {
  it('starts at the given view', () => {
    expect(initialNavigation('options')).toEqual({
      history: ['options'],
      direction: 'forward',
    });
  });

  it('starts empty without a view', () => {
    expect(initialNavigation(undefined).history).toEqual([]);
  });
});

describe('navigate', () => {
  it('pushes a new view going forward', () => {
    expect(navigate(initialNavigation('options'), 'details')).toEqual({
      history: ['options', 'details'],
      direction: 'forward',
    });
  });

  it('treats the previous view as going back', () => {
    const forward = navigate(initialNavigation('options'), 'details');

    expect(navigate(forward, 'options')).toEqual({
      history: ['options'],
      direction: 'backward',
    });
  });

  it('keeps the same object when the view does not change', () => {
    const navigation = initialNavigation('options');

    expect(navigate(navigation, 'options')).toBe(navigation);
  });

  it('pushes a view seen earlier but not directly behind', () => {
    let navigation = initialNavigation('a');
    navigation = navigate(navigation, 'b');
    navigation = navigate(navigation, 'c');

    expect(navigate(navigation, 'a')).toEqual({
      history: ['a', 'b', 'c', 'a'],
      direction: 'forward',
    });
  });
});
