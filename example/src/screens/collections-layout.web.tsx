import { Stack } from 'expo-router';

// react-native-screen-transitions is native-only; the web uses a plain stack.
export default function CollectionsLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
