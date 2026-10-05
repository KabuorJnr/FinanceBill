import type { THostRef } from '../types';

// The web tray grows from the bottom of the page instead of the trigger, so
// there is no native view tag to resolve.
const resolveOriginTag = (_instance: THostRef): number | null => null;

export { resolveOriginTag };
