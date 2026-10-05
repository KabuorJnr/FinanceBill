import {
  AuthRequest,
  exchangeCodeAsync,
  fetchDiscoveryAsync,
  makeRedirectUri,
} from 'expo-auth-session';
import {
  CryptoDigestAlgorithm,
  digestStringAsync,
  randomUUID,
} from 'expo-crypto';
import { maybeCompleteAuthSession } from 'expo-web-browser';
import {
  GoogleAuthProvider,
  OAuthProvider,
  signInWithCredential,
  type Auth,
  type AuthCredential,
  type UserCredential,
} from 'firebase/auth';

maybeCompleteAuthSession();

// Client IDs come from example/.env. Expo inlines EXPO_PUBLIC_* at build time,
// so each one is read with a literal property access.
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const MICROSOFT_CLIENT_ID = process.env.EXPO_PUBLIC_MICROSOFT_CLIENT_ID;
const MICROSOFT_TENANT = process.env.EXPO_PUBLIC_MICROSOFT_TENANT || 'common';

export type TSocialProvider = 'google' | 'microsoft';

export const isProviderConfigured: Record<TSocialProvider, boolean> = {
  google: Boolean(GOOGLE_WEB_CLIENT_ID),
  microsoft: Boolean(MICROSOFT_CLIENT_ID),
};

/** Thrown when the person closes the sign-in sheet; not an error to show. */
export class SignInCancelled extends Error {
  constructor() {
    super('Sign-in cancelled');
  }
}

let googleConfigured = false;

/** Native Google Sign-In, exchanged for a Firebase credential. */
async function googleCredential(): Promise<AuthCredential> {
  // Loaded on demand so builds without the native module still start.
  const { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } =
    await import('@react-native-google-signin/google-signin');

  if (!googleConfigured) {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      iosClientId: GOOGLE_IOS_CLIENT_ID,
    });
    googleConfigured = true;
  }

  try {
    await GoogleSignin.hasPlayServices({
      showPlayServicesUpdateDialog: true,
    });
    const response = await GoogleSignin.signIn();
    if (!isSuccessResponse(response)) throw new SignInCancelled();
    const { idToken } = response.data;
    if (!idToken) throw new Error('Google didn’t return an ID token.');
    return GoogleAuthProvider.credential(idToken);
  } catch (error) {
    if (
      isErrorWithCode(error) &&
      (error.code === statusCodes.SIGN_IN_CANCELLED ||
        error.code === statusCodes.IN_PROGRESS)
    ) {
      throw new SignInCancelled();
    }
    throw error;
  }
}

/**
 * Microsoft (Entra ID) sign-in in the system browser with PKCE. The ID token
 * carries a hashed nonce; Firebase checks it against the raw one.
 */
async function microsoftCredential(): Promise<AuthCredential> {
  const discovery = await fetchDiscoveryAsync(
    `https://login.microsoftonline.com/${MICROSOFT_TENANT}/v2.0`
  );
  const rawNonce = randomUUID();
  const hashedNonce = await digestStringAsync(
    CryptoDigestAlgorithm.SHA256,
    rawNonce
  );
  const redirectUri = makeRedirectUri({ scheme: 'tikiti', path: 'auth' });

  const request = new AuthRequest({
    clientId: MICROSOFT_CLIENT_ID!,
    scopes: ['openid', 'profile', 'email', 'offline_access'],
    redirectUri,
    usePKCE: true,
    extraParams: { nonce: hashedNonce, prompt: 'select_account' },
  });
  const result = await request.promptAsync(discovery);
  if (result.type !== 'success') {
    if (result.type === 'error') {
      throw new Error(
        result.params.error_description ?? 'Microsoft sign-in failed.'
      );
    }
    throw new SignInCancelled();
  }

  const tokens = await exchangeCodeAsync(
    {
      clientId: MICROSOFT_CLIENT_ID!,
      code: result.params.code!,
      redirectUri,
      extraParams: { code_verifier: request.codeVerifier! },
    },
    discovery
  );
  if (!tokens.idToken) throw new Error('Microsoft didn’t return an ID token.');
  return new OAuthProvider('microsoft.com').credential({
    idToken: tokens.idToken,
    rawNonce,
  });
}

/** Native sign-in with the provider, then a Firebase credential sign-in. */
export async function signInWithSocial(
  auth: Auth,
  provider: TSocialProvider
): Promise<UserCredential> {
  if (!isProviderConfigured[provider]) {
    const name = provider === 'google' ? 'Google' : 'Microsoft';
    throw new Error(`${name} sign-in isn’t set up yet. See the README.`);
  }
  const credential =
    provider === 'google'
      ? await googleCredential()
      : await microsoftCredential();
  return signInWithCredential(auth, credential);
}

export async function signOutProviders() {
  if (!googleConfigured) return;
  const { GoogleSignin } =
    await import('@react-native-google-signin/google-signin');
  await GoogleSignin.signOut().catch(() => null);
}
