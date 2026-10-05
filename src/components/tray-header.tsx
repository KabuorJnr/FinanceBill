import * as React from 'react';
import { View } from 'react-native';

import { COMPONENT_NAMES } from '../constants';
import type { ITraySectionProps } from '../interfaces';
import { sectionStyles } from './shared';

const TrayHeader: React.FC<ITraySectionProps> = ({
  style,
  ...rest
}: ITraySectionProps): React.JSX.Element => (
  <View style={[sectionStyles.section, style]} {...rest} />
);

TrayHeader.displayName = COMPONENT_NAMES.HEADER;

export { TrayHeader };
