import type { ViewProps } from 'react-native';
import { codegenNativeComponent } from 'react-native';

interface INativeContainerViewProps extends ViewProps {}

export type { INativeContainerViewProps };

export default codegenNativeComponent<INativeContainerViewProps>(
  'MorphletContainerView',
  { interfaceOnly: true }
);
