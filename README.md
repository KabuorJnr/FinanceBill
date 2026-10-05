# Morphlet

https://github.com/user-attachments/assets/9c98763d-f6f1-4dfb-9a7b-90ca5087efc5

A native, morphing floating tray for React Native.

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
yarn
yarn example ios   # or android
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT
