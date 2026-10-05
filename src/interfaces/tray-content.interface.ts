import type { ColorValue, ViewProps } from 'react-native';

interface ITrayContentProps extends ViewProps {
  backgroundColor?: ColorValue;
  cornerRadius?: number;
  cornerSmoothing?: number;
  horizontalInset?: number;
  bottomOffset?: number;
  topInset?: number;
  maxWidth?: number;
  backdropColor?: ColorValue;
  backdropOpacity?: number;
  dismissible?: boolean;
  draggable?: boolean;
  fadeOnDrag?: boolean;
  fullScreen?: boolean;

  stack?: boolean;

  onDidPresent?: () => void;
  onDidDismiss?: () => void;
}

interface ITrayInsets {
  top: number;
  bottom: number;
  keyboard: number;
  width: number;
  height: number;
}

export type { ITrayContentProps, ITrayInsets };
