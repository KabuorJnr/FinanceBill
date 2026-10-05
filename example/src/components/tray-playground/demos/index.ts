import type { ComponentType } from 'react';
import type { TrayContentProps, TrayTransition } from 'morphlet';

import type { SFSymbol } from '../../symbol-view';
import type { IPlaygroundSettings } from '../playground.theme';
import { AlertDemo } from './alert-demo';
import { FullScreenDemo } from './full-screen-demo';
import { KeyboardDemo } from './keyboard-demo';
import { ScrollingDemo } from './scrolling-demo';
import { StackDemo } from './stack-demo';
import { WalletDemo } from './wallet-demo';

export interface IDemo {
  key: string;
  title: string;
  subtitle: string;
  icon: SFSymbol;
  transition: TrayTransition;
  grow?: boolean;
  defaultView?: string;
  content?: Partial<TrayContentProps>;
  Component: ComponentType<{ settings: IPlaygroundSettings }>;
}

export const DEMOS: IDemo[] = [
  {
    key: 'wallet',
    transition: 'morph',
    title: 'Views',
    subtitle: 'The family drawer',
    icon: 'rectangle.grid.3x3',
    defaultView: 'options',
    Component: WalletDemo,
  },
  {
    key: 'alert',
    transition: 'morph',
    grow: true,
    title: 'Alert',
    subtitle: 'Grows from its card',
    icon: 'exclamationmark.triangle',
    defaultView: 'confirm',
    Component: AlertDemo,
  },
  {
    key: 'scrolling',
    transition: 'morph',
    title: 'Scrolling',
    subtitle: 'Scrolls, then expands',
    icon: 'arrow.up.left.and.arrow.down.right',
    defaultView: 'list',
    Component: ScrollingDemo,
  },
  {
    key: 'keyboard',
    transition: 'morph',
    title: 'Keyboard',
    subtitle: 'Rides the keyboard',
    icon: 'text.bubble',
    Component: KeyboardDemo,
  },
  {
    key: 'stack',
    transition: 'morph',
    title: 'Stack',
    subtitle: 'Each step grows the next',
    icon: 'square.split.1x2.fill',
    Component: StackDemo,
  },
  {
    key: 'full-screen',
    transition: 'slide',
    title: 'Full Screen',
    subtitle: 'Edge to edge',
    icon: 'widget.large',
    defaultView: 'welcome',
    content: { fullScreen: true },
    Component: FullScreenDemo,
  },
];
