import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
  type Auth,
} from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { File, Paths } from 'expo-file-system';

// Expo inlines EXPO_PUBLIC_* variables from example/.env at build time, so
// each one has to be read with a literal property access.
const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  config.apiKey && config.projectId && config.appId
);

/** Firebase Auth's key-value persistence, kept in one JSON file. */
const fileStorage = {
  file: () => new File(Paths.document, 'tikiti-auth.json'),
  async read(): Promise<Record<string, string>> {
    const file = this.file();
    return file.exists ? JSON.parse(await file.text()) : {};
  },
  async write(values: Record<string, string>) {
    const file = this.file();
    if (!file.exists) file.create();
    file.write(JSON.stringify(values));
  },
  async getItem(key: string) {
    return (await this.read())[key] ?? null;
  },
  async setItem(key: string, value: string) {
    await this.write({ ...(await this.read()), [key]: value });
  },
  async removeItem(key: string) {
    const values = await this.read();
    delete values[key];
    await this.write(values);
  },
};

let services: { app: FirebaseApp; auth: Auth; db: Firestore } | null = null;

export function firebase() {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase is not configured. See example/.env.example.');
  }
  if (services) return services;

  const isNew = getApps().length === 0;
  const app = isNew ? initializeApp(config) : getApp();
  // initializeAuth may only run once per app; fast refresh reuses it.
  const auth = isNew
    ? initializeAuth(app, {
        persistence: getReactNativePersistence(fileStorage),
      })
    : getAuth(app);
  services = { app, auth, db: getFirestore(app) };
  return services;
}
