import * as React from 'react';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';

import { COMPONENT_NAMES } from '../constants';
import { TrayBodyContext } from '../context';
import { useTrayContext } from '../hooks';
import type { ITrayBodyProps } from '../interfaces';
import {
  firstViewName,
  fullScreenViewNames,
  resolveContentSpring,
} from '../utils';
import { MorphletSwitchView } from '../views';
import { TrayView } from './tray-view';

const TrayBody: React.FC<ITrayBodyProps> = ({
  transition,
  duration,
  spring,
  style,
  children,
  ...rest
}: ITrayBodyProps): React.JSX.Element => {
  const context = useTrayContext(COMPONENT_NAMES.BODY);
  const { registerDefaultView, registerFullScreenViews } = context;

  const fallbackView = firstViewName(children, TrayView);
  useEffect(() => {
    if (fallbackView !== undefined) {
      registerDefaultView(fallbackView);
    }
  }, [fallbackView, registerDefaultView]);

  const fullScreenKey = fullScreenViewNames(children, TrayView).join('\n');
  useEffect(() => {
    registerFullScreenViews(fullScreenKey ? fullScreenKey.split('\n') : []);
  }, [fullScreenKey, registerFullScreenViews]);

  const activeView = context.view ?? fallbackView;

  return (
    <TrayBodyContext.Provider value={activeView}>
      <MorphletSwitchView
        transition={transition ?? context.transition}
        direction={context.direction}
        duration={duration ?? context.duration}
        spring={resolveContentSpring(
          spring,
          duration,
          context.springs,
          context.duration
        )}
        style={[styles.body, style]}
        {...rest}
      >
        {children}
      </MorphletSwitchView>
    </TrayBodyContext.Provider>
  );
};

const styles = StyleSheet.create({
  body: {
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
  },
});

TrayBody.displayName = COMPONENT_NAMES.BODY;

export { TrayBody };
