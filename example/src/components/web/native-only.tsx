import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { colors, fonts, spacing } from '../../constants';

/** Shown on the web for demos that rely on native-only libraries. */
export function NativeOnly({ title }: { title: string }) {
  const router = useRouter();
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>
        This demo uses native screen transitions. Open it in the iOS or Android
        app.
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.replace('/demos')}
      >
        <Text style={styles.link}>Back to demos</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 28,
    color: colors.text,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 16,
    textAlign: 'center',
    color: colors.textMuted,
  },
  link: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.brand,
  },
});
