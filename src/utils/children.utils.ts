import {
  Children,
  isValidElement,
  type ElementType,
  type ReactNode,
} from 'react';

import type { ITrayViewProps } from '../interfaces';

const viewElements = (
  children: ReactNode,
  viewType: ElementType
): ITrayViewProps[] =>
  Children.toArray(children)
    .filter(
      (child) =>
        isValidElement<ITrayViewProps>(child) && child.type === viewType
    )
    .map((child) => (child as { props: ITrayViewProps }).props);

const firstViewName = (
  children: ReactNode,
  viewType: ElementType
): string | undefined => viewElements(children, viewType)[0]?.name;

const fullScreenViewNames = (
  children: ReactNode,
  viewType: ElementType
): string[] =>
  viewElements(children, viewType)
    .filter((view) => view.fullScreen)
    .map((view) => view.name);

export { firstViewName, fullScreenViewNames };
