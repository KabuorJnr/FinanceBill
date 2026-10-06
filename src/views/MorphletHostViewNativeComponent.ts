import type { CodegenTypes, ColorValue, ViewProps } from 'react-native';
import { Platform, View, codegenNativeComponent, type HostComponent } from 'react-native';

type TNativeSpring = Readonly<{
  mass?: CodegenTypes.WithDefault<CodegenTypes.Double, 0>;
  stiffness?: CodegenTypes.WithDefault<CodegenTypes.Double, 0>;
  damping?: CodegenTypes.WithDefault<CodegenTypes.Double, 0>;
}>;

type TInsetsChangeEvent = Readonly<{
  top: CodegenTypes.Double;
  bottom: CodegenTypes.Double;
  keyboard: CodegenTypes.Double;
  width: CodegenTypes.Double;
  height: CodegenTypes.Double;
}>;

interface INativeHostViewProps extends ViewProps {
  open?: CodegenTypes.WithDefault<boolean, false>;
  cardColor?: ColorValue;
  cornerRadius?: CodegenTypes.WithDefault<CodegenTypes.Double, 32>;
  cornerSmoothing?: CodegenTypes.WithDefault<CodegenTypes.Double, 0.6>;
  bottomOffset?: CodegenTypes.WithDefault<CodegenTypes.Double, 16>;
  backdropColor?: ColorValue;
  backdropOpacity?: CodegenTypes.WithDefault<CodegenTypes.Double, 0.3>;
  dismissible?: CodegenTypes.WithDefault<boolean, true>;
  draggable?: CodegenTypes.WithDefault<boolean, true>;
  fadeOnDrag?: CodegenTypes.WithDefault<boolean, true>;
  fullScreen?: CodegenTypes.WithDefault<boolean, false>;
  stack?: CodegenTypes.WithDefault<boolean, false>;
  originTag?: CodegenTypes.WithDefault<CodegenTypes.Int32, -1>;
  duration?: CodegenTypes.WithDefault<CodegenTypes.Double, 0.25>;
  presentSpring?: TNativeSpring;
  dismissSpring?: TNativeSpring;
  morphSpring?: TNativeSpring;
  layoutSpring?: TNativeSpring;
  snapSpring?: TNativeSpring;

  onWillPresent?: CodegenTypes.DirectEventHandler<null>;
  onDidPresent?: CodegenTypes.DirectEventHandler<null>;
  onWillDismiss?: CodegenTypes.DirectEventHandler<null>;
  onDidDismiss?: CodegenTypes.DirectEventHandler<null>;
  onInsetsChange?: CodegenTypes.DirectEventHandler<TInsetsChangeEvent>;
}

export type { TInsetsChangeEvent, INativeHostViewProps };

export default (Platform.OS === 'ios' ? codegenNativeComponent<INativeHostViewProps>('MorphletHostView') : (View as unknown as HostComponent<INativeHostViewProps>));
