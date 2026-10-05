import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  View,
  type ViewProps,
  type ViewStyle,
} from 'react-native';

import type {
  INativeHostViewProps,
  TInsetsChangeEvent,
} from './MorphletHostViewNativeComponent';
import type { INativeSwitchViewProps } from './MorphletSwitchViewNativeComponent';

// Web stand-ins for Morphlet's native views. The tray floats over the page in
// a portal with a backdrop and a spring-like slide, instead of morphing out of
// its trigger; views swap without the native cross-fade.

type TEvent<T> = { nativeEvent: T };

function insets(): TEvent<TInsetsChangeEvent> {
  return {
    nativeEvent: {
      top: 0,
      bottom: 0,
      keyboard: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    },
  };
}

function MorphletHostView({
  open: openProp,
  cardColor,
  cornerRadius: cornerRadiusProp,
  bottomOffset: bottomOffsetProp,
  backdropColor = '#000000',
  backdropOpacity: backdropOpacityProp,
  dismissible: dismissibleProp,
  fullScreen: fullScreenProp,
  duration: durationProp,
  onWillDismiss,
  onDidPresent,
  onDidDismiss,
  onInsetsChange,
  children,
}: INativeHostViewProps & { children?: ReactNode }) {
  // Codegen defaults arrive as null on web, so apply them here.
  const open = openProp ?? false;
  const cornerRadius = cornerRadiusProp ?? 32;
  const bottomOffset = bottomOffsetProp ?? 16;
  const backdropOpacity = backdropOpacityProp ?? 0.3;
  const dismissible = dismissibleProp ?? true;
  const fullScreen = fullScreenProp ?? false;
  const duration = durationProp ?? 0.25;
  const [mounted, setMounted] = useState(open);
  const [viewport, setViewport] = useState(() =>
    typeof window === 'undefined' ? 800 : window.innerHeight
  );
  const progress = useRef(new Animated.Value(0)).current;
  const callbacks = useRef({ onDidPresent, onDidDismiss, onWillDismiss });
  useEffect(() => {
    callbacks.current = { onDidPresent, onDidDismiss, onWillDismiss };
  });

  if (open && !mounted) setMounted(true);

  useEffect(() => {
    if (!mounted) return;
    const ms = Math.max(160, duration * 1000 * 1.4);
    const animation = Animated.timing(progress, {
      toValue: open ? 1 : 0,
      duration: ms,
      easing: open ? Easing.out(Easing.back(1.1)) : Easing.in(Easing.quad),
      useNativeDriver: false,
    });
    animation.start(({ finished }) => {
      if (!finished) return;
      if (open) {
        callbacks.current.onDidPresent?.({ nativeEvent: null } as never);
      } else {
        setMounted(false);
        callbacks.current.onDidDismiss?.({ nativeEvent: null } as never);
      }
    });
    return () => animation.stop();
  }, [open, mounted, duration, progress]);

  useEffect(() => {
    if (!mounted) return;
    const report = () => {
      setViewport(window.innerHeight);
      onInsetsChange?.(insets() as never);
    };
    report();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && dismissible) {
        callbacks.current.onWillDismiss?.({ nativeEvent: null } as never);
      }
    };
    window.addEventListener('resize', report);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('resize', report);
      window.removeEventListener('keydown', onKey);
    };
  }, [mounted, dismissible, onInsetsChange]);

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <View style={styles.overlay} pointerEvents={open ? 'auto' : 'none'}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: backdropColor,
            opacity: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, backdropOpacity],
              extrapolate: 'clamp',
            }),
          },
        ]}
      >
        <Pressable
          accessibilityLabel="Close"
          style={StyleSheet.absoluteFill}
          onPress={() =>
            dismissible &&
            callbacks.current.onWillDismiss?.({ nativeEvent: null } as never)
          }
        />
      </Animated.View>
      <Animated.View
        style={[
          styles.card,
          fullScreen
            ? styles.cardFull
            : { bottom: bottomOffset, maxHeight: viewport - bottomOffset - 24 },
          {
            backgroundColor: cardColor,
            borderRadius: fullScreen ? 0 : cornerRadius,
            opacity: progress.interpolate({
              inputRange: [0, 0.4, 1],
              outputRange: [0, 1, 1],
              extrapolate: 'clamp',
            }),
            transform: [
              {
                translateY: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [80, 0],
                }),
              },
              {
                scale: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.94, 1],
                }),
              },
            ],
          },
        ]}
      >
        {children}
      </Animated.View>
    </View>,
    document.body
  );
}

/**
 * Lays the tray's content out in normal flow so the card fits it. The card
 * scrolls when content is taller than the window, rather than squeezing it.
 */
function MorphletContainerView({ style, ...rest }: ViewProps) {
  const flat: Record<string, unknown> = { ...StyleSheet.flatten(style) };
  delete flat.position;
  delete flat.top;
  delete flat.left;
  delete flat.maxHeight;
  return <View {...rest} style={[flat as ViewStyle, styles.container]} />;
}

function MorphletSwitchView({
  transition: _transition,
  direction: _direction,
  duration: _duration,
  spring: _spring,
  ...rest
}: INativeSwitchViewProps) {
  return <View {...rest} />;
}

const styles = StyleSheet.create({
  overlay: {
    // react-native-web passes 'fixed' through to CSS.
    position: 'fixed' as 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 1000,
    alignItems: 'center',
  },
  card: {
    position: 'absolute',
    // react-native-web maps this to a scrollable box.
    overflow: 'scroll',
    shadowColor: '#000000',
    shadowOpacity: 0.3,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 10 },
  },
  cardFull: {
    top: 0,
    bottom: 0,
  },
  container: {
    position: 'relative',
  },
});

export type { TInsetsChangeEvent } from './MorphletHostViewNativeComponent';

export { MorphletHostView, MorphletContainerView, MorphletSwitchView };
