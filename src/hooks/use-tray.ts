import type { ITrayState } from '../interfaces';
import { useTrayContext } from './use-tray-context';

const useTray = (): ITrayState => {
  const {
    open,
    setOpen,
    close,
    view,
    setView,
    goBack,
    canGoBack,
    direction,
    fullScreen,
    setFullScreen,
  } = useTrayContext<string>('useTray');
  return {
    open,
    setOpen,
    close,
    view,
    setView,
    goBack,
    canGoBack,
    direction,
    fullScreen,
    setFullScreen,
  };
};

export { useTray };
