import * as React from 'react';
import { View } from 'react-native';

import { COMPONENT_NAMES } from '../constants';
import type { ITraySectionProps } from '../interfaces';
import { sectionStyles } from './shared';

const TrayFooter: React.FC<ITraySectionProps> = ({
  style,
  ...rest
}: ITraySectionProps): React.JSX.Element => (
  <View style={[sectionStyles.section, style]} {...rest} />
);

TrayFooter.displayName = COMPONENT_NAMES.FOOTER;

export { TrayFooter };
