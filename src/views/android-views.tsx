import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  PanResponder,
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

function getDimensions() {
  const { width, height } = Dimensions.get('window');
  return { width, height };
}

function MorphletHostView({
  open: openProp,
  cardColor = '#1C1C1E',
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
  const open = openProp ?? false;
  const cornerRadius = cornerRadiusProp ?? 28;
  const bottomOffset = bottomOffsetProp ?? 16;
  const backdropOpacity = backdropOpacityProp ?? 0.45;
  const dismissible = dismissibleProp ?? true;
  const fullScreen = fullScreenProp ?? false;
  const duration = durationProp ?? 0.25;

  const [mounted, setMounted] = useState(open);
  const [dims, setDims] = useState(getDimensions);
  const progress = useRef(new Animated.Value(0)).current;
  const dragY = useRef(new Animated.Value(0)).current;

  const callbacks = useRef({ onDidPresent, onDidDismiss, onWillDismiss });
  useEffect(() => {
    callbacks.current = { onDidPresent, onDidDismiss, onWillDismiss };
  });

  if (open && !mounted) setMounted(true);

  useEffect(() => {
    const sub = Dimensions.addEventListener('change', () => {
      const d = getDimensions();
      setDims(d);
      onInsetsChange?.({
        nativeEvent: {
          top: 0,
          bottom: 0,
          keyboard: 0,
          width: d.width,
          height: d.height,
        },
      } as never);
    });
    return () => sub.remove();
  }, [onInsetsChange]);

  useEffect(() => {
    if (!mounted) return;
    const ms = Math.max(180, duration * 1000);
    if (open) {
      dragY.setValue(0);
      Animated.spring(progress, {
        toValue: 1,
        damping: 24,
        mass: 0.9,
        stiffness: 280,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          callbacks.current.onDidPresent?.({ nativeEvent: null } as never);
        }
      });
    } else {
      Animated.timing(progress, {
        toValue: 0,
        duration: ms * 0.85,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setMounted(false);
          callbacks.current.onDidDismiss?.({ nativeEvent: null } as never);
        }
      });
    }
  }, [open, mounted, duration, progress, dragY]);

  const requestClose = () => {
    if (dismissible) {
      callbacks.current.onWillDismiss?.({ nativeEvent: null } as never);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gesture) =>
        dismissible && gesture.dy > 8 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) {
          dragY.setValue(gesture.dy);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 120 || gesture.vy > 0.8) {
          requestClose();
        } else {
          Animated.spring(dragY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
        }
      },
    })
  ).current;

  if (!mounted) return null;

  return (
    <Modal
      transparent
      visible={mounted}
      statusBarTranslucent
      animationType="none"
      onRequestClose={requestClose}
    >
      <View style={styles.modalRoot}>
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
            onPress={requestClose}
          />
        </Animated.View>

        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.card,
            fullScreen
              ? styles.cardFull
              : {
                  bottom: bottomOffset,
                  maxHeight: dims.height - bottomOffset - 32,
                  width: Math.min(dims.width - 24, 460),
                },
            {
              backgroundColor: cardColor,
              borderRadius: fullScreen ? 0 : cornerRadius,
              transform: [
                {
                  translateY: Animated.add(
                    progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [dims.height * 0.6, 0],
                      extrapolate: 'clamp',
                    }),
                    dragY
                  ),
                },
                {
                  scale: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.95, 1],
                    extrapolate: 'clamp',
                  }),
                },
              ],
            },
          ]}
        >
          {!fullScreen && (
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>
          )}
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

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
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  card: {
    position: 'absolute',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOpacity: 0.45,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 16,
  },
  cardFull: {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    maxHeight: '100%',
  },
  handleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 2,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  container: {
    position: 'relative',
  },
});

export type { TInsetsChangeEvent } from './MorphletHostViewNativeComponent';

export { MorphletHostView, MorphletContainerView, MorphletSwitchView };
