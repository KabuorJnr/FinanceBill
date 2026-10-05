import { COMPONENT_NAMES } from '../constants';
import { createCompoundComponent } from '../utils';
import { TrayBody } from './tray-body';
import { TrayClose } from './tray-close';
import { TrayContent } from './tray-content';
import { TrayDescription } from './tray-description';
import { TrayFooter } from './tray-footer';
import { TrayHeader } from './tray-header';
import { TrayMorph } from './tray-morph';
import { TrayRoot } from './tray-root';
import { TrayTitle } from './tray-title';
import { TrayTrigger } from './tray-trigger';
import { TrayView } from './tray-view';

type TTrayCompound = {
  readonly Root: typeof TrayRoot;
  readonly Trigger: typeof TrayTrigger;
  readonly Content: typeof TrayContent;
  readonly Header: typeof TrayHeader;
  readonly Body: typeof TrayBody;
  readonly View: typeof TrayView;
  readonly Footer: typeof TrayFooter;
  readonly Close: typeof TrayClose;
  readonly Title: typeof TrayTitle;
  readonly Description: typeof TrayDescription;
  readonly Morph: typeof TrayMorph;
};

type TTray = typeof TrayRoot & TTrayCompound;

const Tray: TTray = createCompoundComponent<typeof TrayRoot, TTrayCompound>(
  COMPONENT_NAMES.ROOT,
  TrayRoot,
  {
    Root: TrayRoot,
    Trigger: TrayTrigger,
    Content: TrayContent,
    Header: TrayHeader,
    Body: TrayBody,
    View: TrayView,
    Footer: TrayFooter,
    Close: TrayClose,
    Title: TrayTitle,
    Description: TrayDescription,
    Morph: TrayMorph,
  }
);

export { Tray };
export type { TTrayCompound, TTray };
