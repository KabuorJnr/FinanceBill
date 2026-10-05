import type { ComponentRef, ReactNode, Ref } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { GlassView } from 'expo-glass-effect';
import { SymbolView, type SFSymbol } from '../symbol-view';

import { isGlassSupported } from '../../utils';
import { ScalePressable } from './scale-pressable';

type TGlassScheme = 'light' | 'dark';

const ICON_COLORS: Record<TGlassScheme, string> = {
  light: '#000000',
  dark: '#FFFFFF',
};

const FALLBACK_FILLS: Record<TGlassScheme, string> = {
  light: 'rgba(255, 255, 255, 0.72)',
  dark: 'rgba(0, 0, 0, 0.32)',
};

interface IGlassShapeProps {
  scheme: TGlassScheme;
  style: ViewStyle;
  children: ReactNode;
}

export function GlassShape({ scheme, style, children }: IGlassShapeProps) {
  if (isGlassSupported) {
    return (
      <GlassView
        isInteractive
        glassEffectStyle="regular"
        colorScheme={scheme}
        style={style}
      >
        {children}
      </GlassView>
    );
  }
  return (
    <View style={[style, { backgroundColor: FALLBACK_FILLS[scheme] }]}>
      {children}
    </View>
  );
}

interface IGlassAction {
  icon: SFSymbol;
  label: string;
  onPress?: () => void;
}

interface IGlassCircleButtonProps extends IGlassAction {
  scheme?: TGlassScheme;
  size?: number;
  iconSize?: number;
  ref?: Ref<ComponentRef<typeof Pressable>>;
}

export function GlassCircleButton({
  icon,
  label,
  onPress,
  scheme = 'light',
  size = 44,
  iconSize = 18,
  ref,
}: IGlassCircleButtonProps) {
  return (
    <ScalePressable
      ref={ref}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      pressedScale={0.9}
      onPress={onPress}
    >
      <GlassShape
        scheme={scheme}
        style={{
          ...styles.center,
          width: size,
          height: size,
          borderRadius: size / 2,
        }}
      >
        <SymbolView
          name={icon}
          size={iconSize}
          weight="semibold"
          tintColor={ICON_COLORS[scheme]}
        />
      </GlassShape>
    </ScalePressable>
  );
}

interface IGlassCapsuleProps {
  items: IGlassAction[];
  scheme?: TGlassScheme;
  height?: number;
  iconSize?: number;
  children?: ReactNode;
}

export function GlassCapsule({
  items,
  scheme = 'light',
  height = 44,
  iconSize = 18,
  children,
}: IGlassCapsuleProps) {
  return (
    <GlassShape
      scheme={scheme}
      style={{ ...styles.capsule, height, borderRadius: height / 2 }}
    >
      {items.map((item) => (
        <Pressable
          key={item.label}
          accessibilityRole="button"
          accessibilityLabel={item.label}
          hitSlop={4}
          onPress={item.onPress}
          style={[styles.center, { width: height + 4, height }]}
        >
          <SymbolView
            name={item.icon}
            size={iconSize}
            weight="semibold"
            tintColor={ICON_COLORS[scheme]}
          />
        </Pressable>
      ))}
      {children}
    </GlassShape>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  capsule: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
});
