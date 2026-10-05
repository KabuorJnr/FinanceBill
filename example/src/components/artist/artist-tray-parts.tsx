import {
  Children,
  useEffect,
  type ComponentRef,
  type ReactNode,
  type Ref,
} from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type PressableProps,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { GlassView } from 'expo-glass-effect';
import { SymbolView, type SFSymbol } from '../symbol-view';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Tray } from 'morphlet';

import { isGlassSupported, sfFont } from '../../utils';
import { artistColors, artistType } from './artist.theme';

const ICON_BUTTON_SIZE = 30;
const GLASS_ICON_SIZE = 34;
const BUTTON_HEIGHT = 50;

const FADE = { duration: 260, easing: Easing.out(Easing.quad) };

function useFade(on: boolean) {
  const amount = useSharedValue(on ? 1 : 0);
  useEffect(() => {
    amount.value = withTiming(on ? 1 : 0, FADE);
  }, [on, amount]);
  return amount;
}

const PRESS_SPRING = { stiffness: 420, damping: 24, mass: 0.6 };
const PRESSED_SCALE = 1.06;
const PRESSED_HIGHLIGHT = Platform.OS === 'ios' ? 0.14 : 0;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface IGlassPressableProps extends Omit<
  PressableProps,
  'style' | 'children'
> {
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  radius: number;
  tint?: string;
  isTinted?: boolean;
  fallbackColor: string;
  children: ReactNode;
  ref?: Ref<ComponentRef<typeof Pressable>>;
}

export function GlassPressable({
  style,
  contentStyle,
  radius,
  tint,
  isTinted = true,
  fallbackColor,
  children,
  disabled,
  onPressIn,
  onPressOut,
  ref,
  ...rest
}: IGlassPressableProps) {
  const pressed = useSharedValue(0);
  const tinted = useFade(!!tint && isTinted);

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + (PRESSED_SCALE - 1) * pressed.value }],
  }));
  const highlightStyle = useAnimatedStyle(() => ({
    opacity: Math.max(0, pressed.value) * PRESSED_HIGHLIGHT,
  }));
  const tintStyle = useAnimatedStyle(() => ({ opacity: tinted.value }));

  const shape = [StyleSheet.absoluteFill, { borderRadius: radius }];
  const layers = (
    <>
      {tint && (
        <Animated.View
          pointerEvents="none"
          style={[shape, { backgroundColor: tint }, tintStyle]}
        />
      )}
      <Animated.View
        pointerEvents="none"
        style={[shape, styles.highlight, highlightStyle]}
      />
      <View pointerEvents="none" style={[styles.content, contentStyle]}>
        {children}
      </View>
    </>
  );

  return (
    <AnimatedPressable
      ref={ref}
      disabled={disabled}
      onPressIn={(event) => {
        pressed.value = withSpring(1, PRESS_SPRING);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        pressed.value = withSpring(0, PRESS_SPRING);
        onPressOut?.(event);
      }}
      style={[style, pressStyle]}
      {...rest}
    >
      {isGlassSupported ? (
        <GlassView
          glassEffectStyle="clear"
          colorScheme="dark"
          isInteractive
          style={shape}
        >
          {layers}
        </GlassView>
      ) : (
        <View style={[shape, { backgroundColor: fallbackColor }]}>
          {layers}
        </View>
      )}
    </AnimatedPressable>
  );
}

interface ITrayIconButtonProps {
  icon: SFSymbol;
  label: string;
  onPress?: () => void;
}

export function TrayIconButton({ icon, label, onPress }: ITrayIconButtonProps) {
  return (
    <GlassPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      onPress={onPress}
      radius={GLASS_ICON_SIZE / 2}
      fallbackColor={artistColors.card}
      style={trayStyles.glassIconButton}
    >
      <SymbolView
        name={icon}
        size={14}
        weight="bold"
        tintColor={
          isGlassSupported ? artistColors.text : artistColors.textSecondary
        }
      />
    </GlassPressable>
  );
}

export function TrayCloseButton() {
  return (
    <Tray.Close asChild>
      <TrayIconButton icon="xmark" label="Close" />
    </Tray.Close>
  );
}

export function TrayGroup({ children }: { children: ReactNode }) {
  return (
    <View style={trayStyles.group}>
      {Children.toArray(children).map((child, index) => (
        <View key={index} style={index > 0 && trayStyles.groupDivider}>
          {child}
        </View>
      ))}
    </View>
  );
}

interface ITrayRowProps {
  icon: SFSymbol;
  title: string;
  onPress?: () => void;
  navigates?: boolean;
}

export function TrayRow({ icon, title, onPress, navigates }: ITrayRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        trayStyles.row,
        pressed && trayStyles.rowPressed,
      ]}
    >
      <SymbolView
        name={icon}
        size={18}
        weight="medium"
        tintColor={artistColors.text}
        style={trayStyles.rowIcon}
      />
      <Text style={[artistType.body, trayStyles.rowTitle]} numberOfLines={1}>
        {title}
      </Text>
      {navigates && (
        <SymbolView
          name="chevron.right"
          size={13}
          weight="semibold"
          tintColor={artistColors.textTertiary}
        />
      )}
    </Pressable>
  );
}

interface ITrayTextFieldProps extends TextInputProps {
  icon: SFSymbol;
}

export function TrayTextField({ icon, style, ...rest }: ITrayTextFieldProps) {
  return (
    <View style={trayStyles.row}>
      <SymbolView
        name={icon}
        size={17}
        weight="medium"
        tintColor={artistColors.textSecondary}
        style={trayStyles.rowIcon}
      />
      <TextInput
        placeholderTextColor={artistColors.textTertiary}
        selectionColor={artistColors.accent}
        keyboardAppearance="dark"
        style={[artistType.body, trayStyles.textField, style]}
        {...rest}
      />
    </View>
  );
}

interface ITrayFactProps {
  label: string;
  value: string;
}

export function TrayFact({ label, value }: ITrayFactProps) {
  return (
    <View style={trayStyles.fact}>
      <Text style={[artistType.body, trayStyles.factLabel]}>{label}</Text>
      <Text style={[artistType.body, trayStyles.factValue]} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

interface ITrayButtonProps {
  label: string;
  onPress?: () => void;
  icon?: SFSymbol | ((color: string) => ReactNode);
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  ref?: Ref<ComponentRef<typeof Pressable>>;
}

export function TrayButton({
  label,
  onPress,
  icon,
  variant = 'primary',
  disabled = false,
  ref,
}: ITrayButtonProps) {
  const isPrimary = variant === 'primary';
  const color =
    isPrimary && !isGlassSupported ? artistColors.playIcon : artistColors.text;

  const enabled = useFade(!disabled);
  const contentStyle = useAnimatedStyle(() => ({
    opacity: 0.45 + 0.55 * enabled.value,
  }));

  return (
    <GlassPressable
      ref={ref}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      radius={BUTTON_HEIGHT / 2}
      tint={isPrimary ? PRIMARY_TINT : undefined}
      isTinted={!disabled}
      fallbackColor={isPrimary ? artistColors.play : artistColors.card}
      style={trayStyles.button}
    >
      <Animated.View style={[trayStyles.buttonContent, contentStyle]}>
        {typeof icon === 'function'
          ? icon(color)
          : icon && (
              <SymbolView
                name={icon}
                size={16}
                weight="semibold"
                tintColor={color}
              />
            )}
        <Text style={[trayStyles.buttonLabel, { color }]}>{label}</Text>
      </Animated.View>
    </GlassPressable>
  );
}

const PRIMARY_TINT = 'rgba(255, 55, 95, 0.78)';

const styles = StyleSheet.create({
  content: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlight: {
    backgroundColor: '#FFFFFF',
  },
});

export const trayStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  heading: {
    flex: 1,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headingText: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 20,
    ...sfFont('700'),
    color: artistColors.text,
  },
  page: {
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  glassIconButton: {
    width: GLASS_ICON_SIZE,
    height: GLASS_ICON_SIZE,
  },
  iconButton: {
    width: ICON_BUTTON_SIZE,
    height: ICON_BUTTON_SIZE,
    borderRadius: ICON_BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: artistColors.card,
  },
  group: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: artistColors.card,
  },
  groupDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: artistColors.separator,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 52,
    paddingHorizontal: 16,
  },
  rowPressed: {
    backgroundColor: artistColors.cardPressed,
  },
  rowIcon: {
    width: 22,
    height: 22,
  },
  rowTitle: {
    flex: 1,
  },
  textField: {
    flex: 1,
    paddingVertical: 14,
  },
  fact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  factLabel: {
    color: artistColors.textSecondary,
  },
  factValue: {
    flexShrink: 1,
    textAlign: 'right',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    height: BUTTON_HEIGHT,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonPrimary: {
    backgroundColor: artistColors.play,
  },
  buttonSecondary: {
    backgroundColor: artistColors.card,
  },
  buttonLabel: {
    fontSize: 17,
    ...sfFont('600'),
  },
});
