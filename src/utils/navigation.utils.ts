import type { INavigation } from '../interfaces';

const navigate = (navigation: INavigation, view: string): INavigation => {
  const { history } = navigation;
  if (history[history.length - 1] === view) {
    return navigation;
  }
  if (history.length > 1 && history[history.length - 2] === view) {
    return { history: history.slice(0, -1), direction: 'backward' };
  }
  return { history: [...history, view], direction: 'forward' };
};

const initialNavigation = (view: string | undefined): INavigation => ({
  history: view !== undefined ? [view] : [],
  direction: 'forward',
});

export { navigate, initialNavigation };
