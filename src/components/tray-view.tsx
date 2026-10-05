import * as React from 'react';
import { useContext } from 'react';
import { StyleSheet, View } from 'react-native';

import { COMPONENT_NAMES } from '../constants';
import { TrayBodyContext } from '../context';
import type { ITrayViewProps } from '../interfaces';

const TrayView: React.FC<ITrayViewProps> = ({
  name,
  style,
  fullScreen: _fullScreen,
  ...rest
}: ITrayViewProps): React.JSX.Element | null => {
  const activeView = useContext(TrayBodyContext);
  if (__DEV__ && activeView === null) {
    console.warn(
      `<${COMPONENT_NAMES.VIEW} name="${name}"> must be used within <${COMPONENT_NAMES.BODY}>.`
    );
  }
  if (name !== activeView) {
    return null;
  }
  return <View collapsable={false} style={[styles.view, style]} {...rest} />;
};

const styles = StyleSheet.create({
  view: {
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
  },
});

TrayView.displayName = COMPONENT_NAMES.VIEW;

export { TrayView };
