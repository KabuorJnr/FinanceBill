import type { FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

/** Browsers use Firebase's built-in IndexedDB persistence. */
export function createAuth(app: FirebaseApp, _isNew: boolean): Auth {
  return getAuth(app);
}
