import { findNodeHandle } from 'react-native';

import type { THostRef } from '../types';

const resolveOriginTag = (instance: THostRef): number | null =>
  findNodeHandle(instance) ?? null;

export { resolveOriginTag };
