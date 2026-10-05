import {
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  type Auth,
  type UserCredential,
} from 'firebase/auth';

export type TSocialProvider = 'google' | 'microsoft';

// In browsers Firebase runs the OAuth flow itself, using the client IDs set
// on each provider in the Firebase console. Nothing extra to configure here.
export const isProviderConfigured: Record<TSocialProvider, boolean> = {
  google: true,
  microsoft: true,
};

/** Thrown when the person closes the sign-in popup; not an error to show. */
export class SignInCancelled extends Error {
  constructor() {
    super('Sign-in cancelled');
  }
}

export async function signInWithSocial(
  auth: Auth,
  provider: TSocialProvider
): Promise<UserCredential> {
  const authProvider =
    provider === 'google'
      ? new GoogleAuthProvider()
      : new OAuthProvider('microsoft.com');
  authProvider.setCustomParameters({ prompt: 'select_account' });
  try {
    return await signInWithPopup(auth, authProvider);
  } catch (error) {
    const code = (error as { code?: string }).code ?? '';
    if (
      code.includes('popup-closed-by-user') ||
      code.includes('cancelled-popup-request')
    ) {
      throw new SignInCancelled();
    }
    throw error;
  }
}

export async function signOutProviders() {}
