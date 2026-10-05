import type { FirebaseApp } from 'firebase/app';
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
  type Auth,
} from 'firebase/auth';

import { readJson, writeJson } from './local-store';

/** Firebase Auth's key-value persistence, kept in one JSON document. */
const storage = {
  async read(): Promise<Record<string, string>> {
    return (await readJson<Record<string, string>>('tikiti-auth')) ?? {};
  },
  async getItem(key: string) {
    return (await this.read())[key] ?? null;
  },
  async setItem(key: string, value: string) {
    await writeJson('tikiti-auth', { ...(await this.read()), [key]: value });
  },
  async removeItem(key: string) {
    const values = await this.read();
    delete values[key];
    await writeJson('tikiti-auth', values);
  },
};

export function createAuth(app: FirebaseApp, isNew: boolean): Auth {
  // initializeAuth may only run once per app; fast refresh reuses it.
  return isNew
    ? initializeAuth(app, { persistence: getReactNativePersistence(storage) })
    : getAuth(app);
}
