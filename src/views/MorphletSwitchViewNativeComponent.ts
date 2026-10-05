import type { CodegenTypes, ViewProps } from 'react-native';
import { codegenNativeComponent } from 'react-native';

type TNativeSpring = Readonly<{
  mass?: CodegenTypes.WithDefault<CodegenTypes.Double, 0>;
  stiffness?: CodegenTypes.WithDefault<CodegenTypes.Double, 0>;
  damping?: CodegenTypes.WithDefault<CodegenTypes.Double, 0>;
}>;

interface INativeSwitchViewProps extends ViewProps {
  transition?: CodegenTypes.WithDefault<
    'morph' | 'slide' | 'fade' | 'scale',
    'morph'
  >;
  direction?: CodegenTypes.WithDefault<'forward' | 'backward', 'forward'>;
  duration?: CodegenTypes.WithDefault<CodegenTypes.Double, 0.25>;
  spring?: TNativeSpring;
}

export type { INativeSwitchViewProps };

export default codegenNativeComponent<INativeSwitchViewProps>(
  'MorphletSwitchView'
);
