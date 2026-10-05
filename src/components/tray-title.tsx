import * as React from 'react';
import { Text } from 'react-native';

import { COMPONENT_NAMES } from '../constants';
import type { ITrayTitleProps } from '../interfaces';

const TrayTitle: React.FC<ITrayTitleProps> = (
  props: ITrayTitleProps
): React.JSX.Element => <Text accessibilityRole="header" {...props} />;

TrayTitle.displayName = COMPONENT_NAMES.TITLE;

export { TrayTitle };
