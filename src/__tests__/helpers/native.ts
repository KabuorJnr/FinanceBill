import { screen } from '@testing-library/react-native';
import type { ReactTestInstance } from 'react-test-renderer';

import { NATIVE_VIEW_NAMES } from '../../constants';
import type { TNativeViewName } from '../../types';

const findAllNative = (name: TNativeViewName): ReactTestInstance[] =>
  screen.UNSAFE_root.findAll((node) => String(node.type) === name);

const findNative = (name: TNativeViewName): ReactTestInstance => {
  const [view] = findAllNative(name);
  if (!view) {
    throw new Error(`No <${name}> rendered.`);
  }
  return view;
};

const hostView = (): ReactTestInstance =>
  findNative(NATIVE_VIEW_NAMES.HOST_VIEW);

const containerViews = (): ReactTestInstance[] =>
  findAllNative(NATIVE_VIEW_NAMES.CONTAINER_VIEW);

const switchViews = (): ReactTestInstance[] =>
  findAllNative(NATIVE_VIEW_NAMES.SWITCH_VIEW);

export { findAllNative, findNative, hostView, containerViews, switchViews };
