import type { PressableProps } from 'react-native';

interface ITrayCloseProps extends PressableProps {
  asChild?: boolean;
}

interface ITrayTriggerProps extends ITrayCloseProps {
  morph?: boolean;
}

export type { ITrayCloseProps, ITrayTriggerProps };
