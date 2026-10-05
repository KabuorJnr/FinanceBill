import * as React from 'react';
import { useContext } from 'react';
import { View } from 'react-native';

import { COMPONENT_NAMES, TRAY_DEFAULTS } from '../constants';
import { TrayContext } from '../context';
import type { ITrayMorphProps } from '../interfaces';
import { resolveContentSpring } from '../utils';
import { MorphletSwitchView } from '../views';

const TrayMorph: React.FC<ITrayMorphProps> = ({
  value,
  transition,
  duration,
  spring,
  children,
  ...rest
}: ITrayMorphProps): React.JSX.Element => {
  const context = useContext(TrayContext);
  const rootDuration = context?.duration ?? TRAY_DEFAULTS.DURATION;

  return (
    <MorphletSwitchView
      transition={transition ?? context?.transition ?? TRAY_DEFAULTS.TRANSITION}
      direction={context?.direction ?? 'forward'}
      duration={duration ?? rootDuration}
      spring={resolveContentSpring(
        spring,
        duration,
        context?.springs,
        rootDuration
      )}
      {...rest}
    >
      <View key={String(value)} collapsable={false}>
        {children}
      </View>
    </MorphletSwitchView>
  );
};

TrayMorph.displayName = COMPONENT_NAMES.MORPH;

export { TrayMorph };
