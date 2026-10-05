# Morphlet Kenya

https://github.com/user-attachments/assets/9c98763d-f6f1-4dfb-9a7b-90ca5087efc5

A native, morphing floating tray for React Native, with an example app customised for the Kenyan market.

Based on [rit3zh/morphlet](https://github.com/rit3zh/morphlet) (MIT). The library in `src/` is unchanged; the Kenyan customisation lives in the example app.

## What's Kenyan about it

- **Safiri** (`example/src/screens/safiri-screen.tsx`): a ride-hailing map built on `react-native-maps`.
  - Five cities: Nairobi, Mombasa, Kisumu, Nakuru and Eldoret, each with real landmarks (KICC, JKIA, Sarit Centre, Fort Jesus, Nyali Beach, Dunga Beach, Lake Nakuru National Park, Kipchoge Keino Stadium and more).
  - Ride types priced in KES: Boda Boda, Tuk-Tuk, Matatu, Safiri Go and Safiri XL. Fares come from the trip distance.
  - Checkout with M-Pesa, Airtel Money or cash. The app checks Kenyan mobile numbers (`07…`, `01…`, `+254…`) and walks through a simulated STK push before showing the driver, the vehicle and its yellow number plate.
  - Every button morphs into its tray: the city picker, "Where to?", the suggestion chips and "Cancel trip".
- **Playground**: the Send and Activity demos use M-Pesa, Airtel Money and bank balances in KES with Kenyan names, in place of crypto.

City and landmark data is in `example/src/components/safiri/kenya.data.ts`. Coordinates are approximate, and fares and M-Pesa charges are illustrative.

### Maps setup

- **iOS** uses Apple Maps. No key needed.
- **Android** uses Google Maps. Set a key with Maps SDK for Android enabled before you prebuild or run:

```sh
GOOGLE_MAPS_API_KEY=your-key bun example android
```

`example/app.config.js` passes the key to the `react-native-maps` config plugin, so it is never committed.

```tsx
<Tray.Root>
  <Tray.Trigger morph>…</Tray.Trigger>
  <Tray.Content>…</Tray.Content>
</Tray.Root>
```

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
