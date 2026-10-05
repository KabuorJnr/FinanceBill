import { describe, expect, it } from '@jest/globals';
import { Text } from 'react-native';

import type { ITrayViewProps } from '../../interfaces';
import { firstViewName, fullScreenViewNames } from '../../utils';

const Page = (_: ITrayViewProps) => null;

describe('firstViewName', () => {
  it('returns the first matching view', () => {
    const children = [
      <Text key="text">Intro</Text>,
      <Page key="a" name="a" />,
      <Page key="b" name="b" />,
    ];

    expect(firstViewName(children, Page)).toBe('a');
  });

  it('returns undefined without matching views', () => {
    expect(firstViewName(<Text>Only text</Text>, Page)).toBeUndefined();
  });
});

describe('fullScreenViewNames', () => {
  it('lists only the views marked full screen', () => {
    const children = [
      <Page key="a" name="a" />,
      <Page key="b" name="b" fullScreen />,
      <Page key="c" name="c" fullScreen />,
    ];

    expect(fullScreenViewNames(children, Page)).toEqual(['b', 'c']);
  });

  it('ignores fragments and other components', () => {
    expect(fullScreenViewNames(<Text>Only text</Text>, Page)).toEqual([]);
  });
});
