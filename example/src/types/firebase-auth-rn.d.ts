// firebase/auth's public types are the browser build, but Metro resolves the
// React Native build at runtime, which also exports getReactNativePersistence.
import type { Persistence, ReactNativeAsyncStorage } from 'firebase/auth';

declare module 'firebase/auth' {
  export function getReactNativePersistence(
    storage: ReactNativeAsyncStorage
  ): Persistence;
}
