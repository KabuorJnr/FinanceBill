# Morphlet Kenya

https://github.com/user-attachments/assets/9c98763d-f6f1-4dfb-9a7b-90ca5087efc5

A native, morphing floating tray for React Native, with an example app customised for the Kenyan market.

Based on [rit3zh/morphlet](https://github.com/rit3zh/morphlet) (MIT). The library in `src/` is unchanged; the Kenyan customisation lives in the example app.

## What's Kenyan about it

- **Tikiti** (`example/src/screens/tikiti-screen.tsx`) is an events platform for Kenya, built on morphlet's morphing trays.
  - **Discover**: every upcoming event from every organiser, filtered by city (Nairobi, Mombasa, Kisumu, Nakuru, Eldoret) and category (concert, festival, comedy, sports, culture, conference). Each event morphs into a tray with:
    - **Event**: a venue map, date, time, organiser and description.
    - **Tickets**: the organiser's own ticket types in KSh, up to 8 per order. **Checkout** is stacked on top: name and Kenyan phone number, then M-Pesa or Airtel Money with a simulated STK push. Free tickets skip payment.
    - **Directions** with **Ride**, Drive, Walk and Matatu. Ride books a Boda Boda, Tuk-Tuk or car priced in KSh. The other modes open Apple or Google Maps.
    - **Where to Stay**: hotels nearest the venue.
  - **For organisers**: companies create an organiser account, then post events in steps: details → venue (from the catalogue, or any venue in a city) → date and time → up to 5 ticket types with price and capacity → review → publish. They can see and delete their own events.
  - **Featured tour** (`/artist`): the original artist page, following morphlet's concert demo, for the fictional artist Nyota.
- **Where to Stay**: 76 well-known hotels, beach resorts, safari lodges and camps in six regions. Each has room types with **nightly rates** and meal plans: bed & breakfast for hotels, half board for beach resorts, full board for lodges and camps. Pick a room, nights and rooms to see _rate × nights × rooms_, then get directions or reserve (demo).
- **Playground**: the Send and Activity demos use M-Pesa, Airtel Money and bank balances in KES with Kenyan names, in place of crypto.

Seed data lives in `example/src/components/tikiti/events.data.ts`, `hotels.data.ts` and `tikiti.data.ts`. The starting organisers, artists, events, ticket prices and drivers are fictional. Hotels are real places, but the list is curated, not complete, and their rates are rough indications. Coordinates are approximate, and nothing is charged or booked.

### Maps setup

- **iOS** uses Apple Maps. No key needed.
- **Android** uses Google Maps and needs a key with Maps SDK for Android enabled. Copy `example/.env.example` to `example/.env` and set `GOOGLE_MAPS_API_KEY`:

```sh
cp example/.env.example example/.env   # then paste your key
bun example android
```

Expo loads `example/.env` automatically, and `example/app.config.js` passes the key to the `react-native-maps` config plugin. `.env` is gitignored, so the key is never committed. A Maps key ends up inside the Android app, so restrict it to your package name and signing certificate in Google Cloud Console.

### Firebase setup

Posted events and organiser accounts use **Firebase** (Auth plus Firestore). Without a Firebase config, the app falls back to storing them on the phone, behind the same interface (`events.backend.ts`).

1. In the [Firebase console](https://console.firebase.google.com/) for project `social-app-2d78a`, open **Project settings → General → Your apps** and add a **Web app** if there isn't one. Copy its `apiKey` and `appId` into `example/.env`. The other `EXPO_PUBLIC_FIREBASE_*` values are already filled in; see `example/.env.example`.
2. **Authentication → Sign-in method**: enable **Email/Password**, **Google** and **Microsoft** (see _Sign-in with Google and Microsoft_ below).
3. **Firestore Database**: create a database, then deploy the rules in `example/firebase/`:

   ```sh
   cd example/firebase
   npx firebase-tools login
   npx firebase-tools deploy --only firestore:rules
   ```

   Anyone can read events. Only a signed-in organiser can post, and only the organiser who posted an event can change or delete it.

#### Sign-in with Google and Microsoft

Organisers can sign up with Google, Microsoft or email and password. Email accounts can reset their password. First-time Google or Microsoft users add a company name and M-Pesa phone number before posting. Firebase's web popups don't work in React Native apps, so each provider signs in natively and passes a credential to Firebase (`signInWithCredential`). Both need a development build (`bun example ios` / `android`), not Expo Go.

- **Google** (`@react-native-google-signin/google-signin`):
  1. Enable Google in Firebase Authentication. Copy the **Web client ID** from its _Web SDK configuration_ into `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`.
  2. **Android**: add an Android app in Firebase project settings with the app's package name (`com.tikiti.app`) and your signing key's **SHA-1**. For debug builds, get it with `cd android && ./gradlew signingReport`.
  3. **iOS**: add an iOS app with the bundle ID, then copy `CLIENT_ID` from its `GoogleService-Info.plist` into `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`. `app.config.js` derives the URL scheme the plugin needs.
- **Microsoft** (`expo-auth-session`, OAuth code flow with PKCE):
  1. In the Azure portal, open **Microsoft Entra ID → App registrations → New registration**. Choose _Accounts in any organizational directory and personal Microsoft accounts_, and under **Mobile and desktop applications** add the redirect URI `tikiti://auth`.
  2. Copy the **Application (client) ID** into `EXPO_PUBLIC_MICROSOFT_CLIENT_ID`.
  3. In Firebase Authentication, enable **Microsoft** with that client ID and a client secret from **Certificates & secrets**. Add the Firebase callback URL it shows as a **Web** redirect URI in Azure too.

Until a provider's client ID is set, its button shows as unavailable and the other sign-in options keep working.

Data model: `events/{eventId}` (the event with `organizerId`) and `organizers/{uid}` (company name, phone and email).

The app only needs the public Web config. **Never put a service account (Admin SDK) key in the app or in git.** `.gitignore` blocks the usual file names.

### Web app and Android APK

The app (`com.tikiti.app`) opens on Tikiti. The original morphlet demos are under **Morphlet demos** (`/demos`).

- **Web**: `cd example && bun run build:web` writes `example/dist`. Host it on Firebase with `cd example/firebase && npx firebase-tools deploy --only hosting`, which is preconfigured for single-page routing. On the web:
  - Morphlet trays open as an animated overlay card. Close them with the backdrop or Esc.
  - Maps use OpenStreetMap embeds, which need no key.
  - Google and Microsoft sign-in use Firebase popups.
  - Posted events stay in the browser until Firebase is configured.
  - The Collections demo is native-only.
- **Android APK**: the **Android APK** GitHub Actions workflow (`.github/workflows/android-apk.yml`) builds a release APK on every push to the app, or on demand from the Actions tab. Download it from the run's _Artifacts_. Add the optional repository secrets listed in the workflow to bake in the Maps key and Firebase/OAuth config. The APK is signed with the debug key; use your own keystore before publishing to Google Play.

## Installation

```sh
npm install morphlet
cd ios && pod install
```

Requires the New Architecture. Android API 24+. On Expo, use a development build.

## Usage

```tsx
import { Text } from 'react-native';
import { Tray } from 'morphlet';

export function Example() {
  return (
    <Tray.Root>
      <Tray.Trigger>
        <Text>Open</Text>
      </Tray.Trigger>

      <Tray.Content>
        <Tray.Header>
          <Tray.Title>Hello</Tray.Title>
        </Tray.Header>
        <Tray.Body>
          <Tray.Description>A tray that springs to fit.</Tray.Description>
        </Tray.Body>
        <Tray.Footer>
          <Tray.Close>
            <Text>Done</Text>
          </Tray.Close>
        </Tray.Footer>
      </Tray.Content>
    </Tray.Root>
  );
}
```

### Views

```tsx
<Tray.Root defaultView="options">
  <Tray.Trigger>…</Tray.Trigger>
  <Tray.Content>
    <Tray.Body>
      <Tray.View name="options">
        <Options />
      </Tray.View>
      <Tray.View name="details" fullScreen>
        <Details />
      </Tray.View>
    </Tray.Body>
  </Tray.Content>
</Tray.Root>;

function Options() {
  const { setView } = useTray();
  return <Row title="Details" onPress={() => setView('details')} />;
}
```

Wrap anything in `<Tray.Morph value={...}>` to transition it when `value` changes. Add `stack` to `Tray.Content` to push the tray below back like an iOS sheet.

## API

| Component                         | Purpose                                                                            |
| --------------------------------- | ---------------------------------------------------------------------------------- |
| `Tray.Root`                       | Open state and active view. `open`, `view`, `transition`, `animation`.             |
| `Tray.Trigger` / `Tray.Close`     | Open or close. `asChild`, and `morph` to grow the tray from the trigger.           |
| `Tray.Content`                    | The card. `backgroundColor`, `cornerRadius`, `dismissible`, `fullScreen`, `stack`. |
| `Tray.Header` / `Tray.Footer`     | Fixed sections around the body.                                                    |
| `Tray.Body` / `Tray.View`         | Morphs between named views.                                                        |
| `Tray.Morph`                      | Transitions children when `value` changes.                                         |
| `Tray.Title` / `Tray.Description` | Accessible text.                                                                   |

```ts
const { open, close, view, setView, goBack, canGoBack, setFullScreen } =
  useTray();
```

**Transitions:** `morph` · `slide` · `fade` · `scale`
**Animation presets:** `default` · `smooth` · `snappy` · `bouncy` — or pass custom springs:

```tsx
<Tray.Root animation={{ preset: 'smooth', morph: { response: 0.6, dampingFraction: 0.8 } }}>
```

## Example

```sh
bun install
bun example ios   # or android
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT
