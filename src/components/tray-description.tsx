import * as React from 'react';
import { Text } from 'react-native';

import { COMPONENT_NAMES } from '../constants';
import type { ITrayDescriptionProps } from '../interfaces';

const TrayDescription: React.FC<ITrayDescriptionProps> = (
  props: ITrayDescriptionProps
): React.JSX.Element => <Text {...props} />;

TrayDescription.displayName = COMPONENT_NAMES.DESCRIPTION;

export { TrayDescription };
