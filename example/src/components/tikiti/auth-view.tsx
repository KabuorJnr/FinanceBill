import { useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { useTray } from 'morphlet';

import { AnimatedTabs } from '../artist/animated-tabs';
import { SymbolView } from '../symbol-view';
import {
  SignInCancelled,
  isProviderConfigured,
  type TSocialProvider,
} from './auth-providers';
import { useEvents } from './events.store';
import { normalizeKenyanPhone } from './tikiti.data';
import { Field, Group, TikitiButton, tikitiType } from './tikiti-parts';
import { tikitiColors } from './tikiti.theme';

const MIN_PASSWORD = 8;

export function friendlyError(error: unknown): string | null {
  if (error instanceof SignInCancelled) return null;
  const code = (error as { code?: string }).code ?? '';
  const messages: [string, string][] = [
    [
      'email-already-in-use',
      'That email already has an account. Sign in instead.',
    ],
    [
      'account-exists-with-different-credential',
      'This email already uses another sign-in method. Use that method, e.g. email or Google.',
    ],
    ['invalid-credential', 'Email or password is incorrect.'],
    ['wrong-password', 'Email or password is incorrect.'],
    ['user-not-found', 'No account with that email. Create one instead.'],
    ['weak-password', `Use a password of at least ${MIN_PASSWORD} characters.`],
    ['invalid-email', 'Enter a valid email address.'],
    ['too-many-requests', 'Too many attempts. Wait a minute and try again.'],
    ['user-disabled', 'This account has been disabled.'],
    [
      'operation-not-allowed',
      'This sign-in method isn’t enabled in Firebase yet.',
    ],
    ['permission-denied', 'You don’t have permission to do that.'],
    ['network', 'No connection. Check your internet and try again.'],
    [
      'PLAY_SERVICES_NOT_AVAILABLE',
      'Google Play services is missing or out of date.',
    ],
    [
      'DEVELOPER_ERROR',
      'Google sign-in is misconfigured (check the SHA-1 and web client ID).',
    ],
  ];
  const match = messages.find(([key]) => code.includes(key));
  if (match) return match[1];
  return error instanceof Error ? error.message : 'Something went wrong.';
}

function GoogleLogo() {
  return (
    <Svg width={18} height={18} viewBox="0 0 48 48">
      <Path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <Path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <Path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <Path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </Svg>
  );
}

function MicrosoftLogo() {
  return (
    <Svg width={18} height={18} viewBox="0 0 21 21">
      <Rect x={1} y={1} width={9} height={9} fill="#F25022" />
      <Rect x={11} y={1} width={9} height={9} fill="#7FBA00" />
      <Rect x={1} y={11} width={9} height={9} fill="#00A4EF" />
      <Rect x={11} y={11} width={9} height={9} fill="#FFB900" />
    </Svg>
  );
}

const PROVIDERS: Record<
  TSocialProvider,
  { label: string; Logo: () => React.JSX.Element; light: boolean }
> = {
  // Brand guidelines: Google's light button, Microsoft's dark button.
  google: { label: 'Continue with Google', Logo: GoogleLogo, light: true },
  microsoft: {
    label: 'Continue with Microsoft',
    Logo: MicrosoftLogo,
    light: false,
  },
};

function SocialButton({
  provider,
  busy,
  disabled,
  onPress,
}: {
  provider: TSocialProvider;
  busy: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  const { label, Logo, light } = PROVIDERS[provider];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled, busy }}
      disabled={disabled || busy}
      onPress={onPress}
      style={({ pressed }) => [
        styles.social,
        light ? styles.socialLight : styles.socialDark,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      {busy ? (
        <ActivityIndicator color={light ? '#1F1F1F' : '#FFFFFF'} />
      ) : (
        <Logo />
      )}
      <Text style={[styles.socialLabel, light && styles.socialLabelLight]}>
        {label}
      </Text>
    </Pressable>
  );
}

const MODES = [
  {
    value: 'signUp' as const,
    label: 'Create Account',
    icon: 'person.badge.plus' as const,
  },
  { value: 'signIn' as const, label: 'Sign In', icon: 'person.fill' as const },
];

type TMode = (typeof MODES)[number]['value'];

/** Sign in or sign up with Google, Microsoft or email. */
export function AuthView() {
  const { signUp, signIn, signInWith, resetPassword, backend } = useEvents();
  const { setView } = useTray();
  const [mode, setMode] = useState<TMode>('signUp');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState<TSocialProvider | 'email' | 'reset' | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const isFirebase = backend === 'firebase';
  const normalized = normalizeKenyanPhone(phone);
  const emailOk = /^\S+@\S+\.\S+$/.test(email.trim());
  const passwordOk = !isFirebase || password.length >= MIN_PASSWORD;
  const canSubmit =
    emailOk &&
    (mode === 'signIn' ? !isFirebase || password.length > 0 : passwordOk) &&
    (mode === 'signIn' || (name.trim().length > 1 && normalized !== null));

  const run = async (
    kind: NonNullable<typeof busy>,
    action: () => Promise<void>
  ) => {
    Keyboard.dismiss();
    setBusy(kind);
    setError(null);
    setNotice(null);
    try {
      await action();
    } catch (failure) {
      setError(friendlyError(failure));
    } finally {
      setBusy(null);
    }
  };

  const social = (provider: TSocialProvider) =>
    run(provider, async () => {
      const { needsProfile } = await signInWith(provider);
      setView(needsProfile ? 'profile' : 'mine');
    });

  const submit = () => {
    if (!canSubmit || busy) return;
    run('email', async () => {
      if (mode === 'signUp') {
        await signUp({
          name: name.trim(),
          phone: normalized!,
          email: email.trim(),
          password,
        });
      } else {
        await signIn(email.trim(), password);
      }
      setView('mine');
    });
  };

  const forgot = () => {
    if (!emailOk) {
      setNotice(null);
      setError('Enter your email above, then tap “Forgot password?”.');
      return;
    }
    run('reset', async () => {
      await resetPassword(email.trim());
      setNotice(`We sent a password reset link to ${email.trim()}.`);
    });
  };

  return (
    <View style={styles.page}>
      <View style={styles.intro}>
        <Text style={tikitiType.title}>Karibu, organiser</Text>
        <Text style={tikitiType.caption}>
          Sign in to post events, set ticket prices and sell with M-Pesa.
        </Text>
      </View>

      <View style={styles.socials}>
        {(['google', 'microsoft'] as const).map((provider) => (
          <SocialButton
            key={provider}
            provider={provider}
            busy={busy === provider}
            disabled={
              !isFirebase || !isProviderConfigured[provider] || busy !== null
            }
            onPress={() => social(provider)}
          />
        ))}
        {!isFirebase && (
          <Text style={tikitiType.caption}>
            Google and Microsoft sign-in turn on once Firebase is configured.
          </Text>
        )}
      </View>

      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={tikitiType.caption}>or with email</Text>
        <View style={styles.line} />
      </View>

      <AnimatedTabs
        tabs={MODES}
        value={mode}
        onChange={(next) => {
          setMode(next);
          setError(null);
          setNotice(null);
        }}
      />

      <Group>
        {mode === 'signUp' && (
          <>
            <Field
              icon="building.2.fill"
              placeholder="Company or organiser name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              textContentType="organizationName"
            />
            <Field
              divider
              icon="phone.fill"
              prefix="+254"
              placeholder="712 345 678"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
              maxLength={13}
            />
          </>
        )}
        <Field
          divider={mode === 'signUp'}
          icon="envelope.fill"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType={mode === 'signUp' ? 'username' : 'emailAddress'}
        />
        <Field
          divider
          icon="lock.fill"
          placeholder={
            isFirebase ? 'Password' : 'Password (not needed offline)'
          }
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete={mode === 'signUp' ? 'new-password' : 'current-password'}
          textContentType={mode === 'signUp' ? 'newPassword' : 'password'}
          returnKeyType="go"
          onSubmitEditing={submit}
          trailing={
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                showPassword ? 'Hide password' : 'Show password'
              }
              hitSlop={10}
              onPress={() => setShowPassword((shown) => !shown)}
            >
              <SymbolView
                name={showPassword ? 'eye.slash' : 'eye'}
                size={16}
                weight="medium"
                tintColor={tikitiColors.textSecondary}
              />
            </Pressable>
          }
        />
      </Group>

      <View style={styles.row}>
        <Text style={[tikitiType.caption, styles.grow]}>
          {mode === 'signUp' && isFirebase
            ? `At least ${MIN_PASSWORD} characters.`
            : ' '}
        </Text>
        {mode === 'signIn' && isFirebase && (
          <Pressable accessibilityRole="button" hitSlop={8} onPress={forgot}>
            <Text style={[tikitiType.caption, styles.link]}>
              {busy === 'reset' ? 'Sending…' : 'Forgot password?'}
            </Text>
          </Pressable>
        )}
      </View>

      {!!error && (
        <Text style={[tikitiType.caption, styles.error]}>{error}</Text>
      )}
      {!!notice && (
        <Text style={[tikitiType.caption, styles.notice]}>{notice}</Text>
      )}

      <TikitiButton
        label={
          busy === 'email'
            ? 'Please wait…'
            : mode === 'signUp'
              ? 'Create Organiser Account'
              : 'Sign In'
        }
        disabled={!canSubmit || busy !== null}
        onPress={submit}
      />
      <Text style={[tikitiType.caption, styles.center]}>
        By continuing you agree to Tikiti’s organiser terms and privacy policy.
      </Text>
    </View>
  );
}

/** Company name and phone for accounts made with Google or Microsoft. */
export function ProfileView() {
  const { organizer, completeProfile, signOut } = useEvents();
  const { setView } = useTray();
  const [name, setName] = useState(organizer?.name ?? '');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const normalized = normalizeKenyanPhone(phone);
  const canSave = name.trim().length > 1 && normalized !== null;

  const save = async () => {
    if (!canSave || busy) return;
    Keyboard.dismiss();
    setBusy(true);
    setError(null);
    try {
      await completeProfile({ name: name.trim(), phone: normalized! });
      setView('mine');
    } catch (failure) {
      setError(friendlyError(failure));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.page}>
      <View style={styles.intro}>
        <Text style={tikitiType.title}>One more step</Text>
        <Text style={tikitiType.caption}>
          {organizer?.email ? `Signed in as ${organizer.email}. ` : ''}
          Add the name fans will see on your events and a phone number for
          M-Pesa payouts.
        </Text>
      </View>
      <Group>
        <Field
          icon="building.2.fill"
          placeholder="Company or organiser name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
        <Field
          divider
          icon="phone.fill"
          prefix="+254"
          placeholder="712 345 678"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          maxLength={13}
          returnKeyType="done"
          onSubmitEditing={save}
        />
      </Group>
      {!!error && (
        <Text style={[tikitiType.caption, styles.error]}>{error}</Text>
      )}
      <TikitiButton
        label={busy ? 'Saving…' : 'Save and Continue'}
        disabled={!canSave || busy}
        onPress={save}
      />
      <Pressable
        accessibilityRole="button"
        onPress={async () => {
          await signOut();
          setView('account');
        }}
      >
        <Text style={[tikitiType.caption, styles.center]}>
          Not you? <Text style={styles.link}>Sign out</Text>
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 20,
  },
  intro: {
    gap: 4,
    paddingHorizontal: 2,
  },
  socials: {
    gap: 10,
  },
  social: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 50,
    borderRadius: 25,
  },
  socialLight: {
    backgroundColor: '#FFFFFF',
  },
  socialDark: {
    borderWidth: 1,
    borderColor: '#5E5E5E',
    backgroundColor: '#2F2F2F',
  },
  socialLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  socialLabelLight: {
    color: '#1F1F1F',
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 2,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: tikitiColors.separator,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  grow: {
    flex: 1,
  },
  link: {
    color: tikitiColors.accent,
  },
  error: {
    color: tikitiColors.accent,
  },
  notice: {
    color: tikitiColors.mpesa,
  },
  center: {
    textAlign: 'center',
  },
});
