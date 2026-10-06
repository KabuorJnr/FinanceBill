import { Platform } from 'react-native';
import * as AndroidViews from './android-views';
import MorphletContainerViewNative from './MorphletContainerViewNativeComponent';
import MorphletHostViewNative from './MorphletHostViewNativeComponent';
import MorphletSwitchViewNative from './MorphletSwitchViewNativeComponent';

export type { TInsetsChangeEvent } from './MorphletHostViewNativeComponent';

const isAndroid = Platform.OS === 'android';

export const MorphletHostView = isAndroid
  ? AndroidViews.MorphletHostView
  : MorphletHostViewNative;

export const MorphletContainerView = isAndroid
  ? AndroidViews.MorphletContainerView
  : MorphletContainerViewNative;

export const MorphletSwitchView = isAndroid
  ? AndroidViews.MorphletSwitchView
  : MorphletSwitchViewNative;
