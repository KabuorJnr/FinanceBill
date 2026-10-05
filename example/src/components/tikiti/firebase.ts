import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { createAuth } from './firebase-auth';

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

let services: { app: FirebaseApp; auth: Auth; db: Firestore } | null = null;

export function firebase() {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase is not configured. See example/.env.example.');
  }
  if (services) return services;

  const isNew = getApps().length === 0;
  const app = isNew ? initializeApp(config) : getApp();
  const auth = createAuth(app, isNew);
  services = { app, auth, db: getFirestore(app) };
  return services;
}
