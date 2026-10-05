import { useState, type ComponentRef, type Ref } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Tray } from 'morphlet';

import { SymbolView } from '../components/symbol-view';
import {
  DEFAULT_SETTINGS,
  DEMOS,
  SettingsTray,
  TRAY_CONTENT,
  playgroundColors as colors,
  playgroundType as type,
  type IDemo,
  type IPlaygroundSettings,
} from '../components/tray-playground';

export default function PlaygroundScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [settings, setSettings] =
    useState<IPlaygroundSettings>(DEFAULT_SETTINGS);

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 },
        ]}
      >
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={8}
            onPress={() => router.back()}
            style={styles.back}
          >
            <SymbolView
              name="chevron.left"
              size={15}
              weight="semibold"
              tintColor={colors.text}
            />
          </Pressable>
          <SettingsTray settings={settings} onChange={setSettings} />
        </View>

        <Text style={styles.title}>Playground</Text>

        <View style={styles.grid}>
          {DEMOS.map((demo) => (
            <DemoTray key={demo.key} demo={demo} settings={settings} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

interface IDemoTrayProps {
  demo: IDemo;
  settings: IPlaygroundSettings;
}

function DemoTray({ demo, settings }: IDemoTrayProps) {
  const { Component } = demo;

  return (
    <Tray.Root
      defaultView={demo.defaultView}
      transition={demo.transition}
      duration={settings.duration}
      animation={settings.spring}
    >
      <Tray.Trigger asChild morph={demo.grow}>
        <DemoCard demo={demo} />
      </Tray.Trigger>
      <Tray.Content {...TRAY_CONTENT} {...demo.content}>
        <Component settings={settings} />
      </Tray.Content>
    </Tray.Root>
  );
}

interface IDemoCardProps {
  demo: IDemo;
  onPress?: () => void;
  ref?: Ref<ComponentRef<typeof Pressable>>;
}

function DemoCard({ demo, onPress, ref }: IDemoCardProps) {
  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      accessibilityLabel={`${demo.title}, ${demo.subtitle}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <SymbolView name={demo.icon} size={20} tintColor={colors.text} />
      <View style={styles.cardText}>
        <Text style={[type.value, styles.cardTitle]}>{demo.title}</Text>
        <Text style={[type.caption, styles.cardCaption]}>{demo.subtitle}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 20,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  title: {
    ...type.display,
    fontSize: 34,
    marginTop: 20,
    marginBottom: 20,
    color: colors.text,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  card: {
    width: '48.5%',
    height: 124,
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 24,
    borderCurve: 'continuous',
    backgroundColor: colors.card,
  },
  cardPressed: {
    backgroundColor: colors.cardPressed,
  },
  cardText: {
    gap: 2,
  },
  cardTitle: {
    color: colors.text,
  },
  cardCaption: {
    color: colors.label,
  },
});
