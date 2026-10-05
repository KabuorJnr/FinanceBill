import type { ComponentRef, ReactNode, Ref } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { GlassView } from 'expo-glass-effect';
import { SymbolView, type SymbolViewProps } from '../symbol-view';

import { isGlassSupported } from '../../utils';
import { ScalePressable } from '../artist/scale-pressable';
import {
  collectionColors,
  collectionGlass,
  collectionLayout,
} from './collections.theme';

export type TGlassTone = 'light' | 'dark';

export type TIcon = SymbolViewProps['name'];

const ICON_COLORS: Record<TGlassTone, string> = {
  light: collectionColors.text,
  dark: '#FFFFFF',
};

interface IGlassSurfaceProps {
  tone?: TGlassTone;
  interactive?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

export function GlassSurface({
  tone = 'light',
  interactive = true,
  style,
  children,
}: IGlassSurfaceProps) {
  if (isGlassSupported) {
    return (
      <GlassView
        glassEffectStyle="clear"
        tintColor={collectionGlass[tone]}
        colorScheme={tone}
        isInteractive={interactive}
        style={style}
      >
        {children}
      </GlassView>
    );
  }
  return (
    <View style={[style, styles.fallback, tone === 'dark' && styles.dark]}>
      {children}
    </View>
  );
}

interface IGlassIconButtonProps {
  icon: TIcon;
  label: string;
  onPress?: () => void;
  tone?: TGlassTone;
  size?: number;
  iconSize?: number;
  ref?: Ref<ComponentRef<typeof Pressable>>;
}

export function GlassIconButton({
  icon,
  label,
  onPress,
  tone = 'light',
  size = collectionLayout.buttonSize,
  iconSize = 18,
  ref,
}: IGlassIconButtonProps) {
  return (
    <ScalePressable
      ref={ref}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      pressedScale={0.9}
      onPress={onPress}
    >
      <GlassSurface
        tone={tone}
        style={[
          styles.center,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      >
        <SymbolView
          name={icon}
          size={iconSize}
          weight="semibold"
          tintColor={ICON_COLORS[tone]}
        />
      </GlassSurface>
    </ScalePressable>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallback: {
    backgroundColor: collectionColors.surface,
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  dark: {
    backgroundColor: collectionColors.fab,
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
});
