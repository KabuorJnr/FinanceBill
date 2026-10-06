import type { ViewProps } from 'react-native';
import { Platform, View, codegenNativeComponent, type HostComponent } from 'react-native';

interface INativeContainerViewProps extends ViewProps {}

export type { INativeContainerViewProps };

export default (Platform.OS === 'ios'
  ? codegenNativeComponent<INativeContainerViewProps>(
      'MorphletContainerView',
      { interfaceOnly: true }
    )
  : (View as unknown as HostComponent<INativeContainerViewProps>));
