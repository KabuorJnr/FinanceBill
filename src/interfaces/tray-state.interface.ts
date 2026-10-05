import type { TTrayDirection } from '../types';

interface ITrayState {
  open: boolean;
  setOpen: (open: boolean) => void;
  close: () => void;
  view: string | undefined;
  setView: (view: string) => void;
  goBack: () => void;
  canGoBack: boolean;
  direction: TTrayDirection;
  fullScreen: boolean;
  setFullScreen: (fullScreen: boolean) => void;
}

export type { ITrayState };
