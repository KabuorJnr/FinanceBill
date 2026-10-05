import * as React from 'react';

import { COMPONENT_NAMES } from '../constants';
import { useTrayContext } from '../hooks';
import type { ITrayCloseProps } from '../interfaces';
import { renderTrayPressable } from './shared';

const TrayClose: React.FC<ITrayCloseProps> = (
  props: ITrayCloseProps
): React.ReactElement => {
  const { close } = useTrayContext(COMPONENT_NAMES.CLOSE);
  return renderTrayPressable(props, close);
};

TrayClose.displayName = COMPONENT_NAMES.CLOSE;

export { TrayClose };
