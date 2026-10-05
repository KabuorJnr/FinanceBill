import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SymbolView, type SFSymbol } from '../symbol-view';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';

import { sfFont } from '../../utils';
import { artistColors } from './artist.theme';
import { ScalePressable } from './scale-pressable';

const PADDING = 4;
const GAP = 4;
const TAB_HEIGHT = 36;
const SLIDE_SPRING = { stiffness: 360, damping: 30, mass: 0.8 };

interface IAnimatedTab<TValue extends string> {
  value: TValue;
  label: string;
  icon: SFSymbol;
}

interface IAnimatedTabsProps<TValue extends string> {
  tabs: IAnimatedTab<TValue>[];
  value: TValue;
  onChange: (value: TValue) => void;
}

export function AnimatedTabs<TValue extends string>({
  tabs,
  value,
  onChange,
}: IAnimatedTabsProps<TValue>) {
  const [width, setWidth] = useState(0);
  const index = Math.max(
    0,
    tabs.findIndex((tab) => tab.value === value)
  );
  const tabWidth =
    width > 0
      ? (width - PADDING * 2 - GAP * (tabs.length - 1)) / tabs.length
      : 0;
  const step = tabWidth + GAP;

  const offset = useSharedValue(index * step);
  const hasLaidOut = useRef(false);
  useEffect(() => {
    if (tabWidth <= 0) return;
    offset.value = hasLaidOut.current
      ? withSpring(index * step, SLIDE_SPRING)
      : index * step;
    hasLaidOut.current = true;
  }, [index, step, tabWidth, offset]);

  const capsuleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  return (
    <View
      accessibilityRole="tablist"
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={styles.tabs}
    >
      {tabWidth > 0 && (
        <Animated.View
          pointerEvents="none"
          style={[styles.capsule, { width: tabWidth }, capsuleStyle]}
        />
      )}
      {tabs.map((tab, tabIndex) => (
        <Tab
          key={tab.value}
          tab={tab}
          isSelected={tabIndex === index}
          position={tabIndex * step}
          step={step}
          offset={offset}
          onPress={() => onChange(tab.value)}
        />
      ))}
    </View>
  );
}

interface ITabProps<TValue extends string> {
  tab: IAnimatedTab<TValue>;
  isSelected: boolean;
  position: number;
  step: number;
  offset: SharedValue<number>;
  onPress: () => void;
}

function Tab<TValue extends string>({
  tab,
  isSelected,
  position,
  step,
  offset,
  onPress,
}: ITabProps<TValue>) {
  const coverage = useDerivedValue(() =>
    step > 0
      ? Math.max(0, 1 - Math.abs(offset.value - position) / step)
      : isSelected
        ? 1
        : 0
  );

  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      coverage.value,
      [0, 1],
      [artistColors.text, artistColors.playIcon]
    ),
  }));
  const darkIconStyle = useAnimatedStyle(() => ({ opacity: coverage.value }));
  const lightIconStyle = useAnimatedStyle(() => ({
    opacity: 1 - coverage.value,
  }));

  return (
    <ScalePressable
      accessibilityRole="tab"
      accessibilityState={{ selected: isSelected }}
      pressedScale={0.94}
      onPress={onPress}
      style={styles.tab}
    >
      <View style={styles.icon}>
        <Animated.View style={[StyleSheet.absoluteFill, lightIconStyle]}>
          <SymbolView
            name={tab.icon}
            size={14}
            weight="semibold"
            tintColor={artistColors.text}
            style={styles.icon}
          />
        </Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, darkIconStyle]}>
          <SymbolView
            name={tab.icon}
            size={14}
            weight="semibold"
            tintColor={artistColors.playIcon}
            style={styles.icon}
          />
        </Animated.View>
      </View>
      <Animated.Text style={[styles.label, labelStyle]}>
        {tab.label}
      </Animated.Text>
    </ScalePressable>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    gap: GAP,
    padding: PADDING,
    borderRadius: 16,
    backgroundColor: artistColors.card,
  },
  capsule: {
    position: 'absolute',
    top: PADDING,
    left: PADDING,
    height: TAB_HEIGHT,
    borderRadius: 12,
    backgroundColor: artistColors.play,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    height: TAB_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 18,
    height: 18,
  },
  label: {
    fontSize: 14,
    ...sfFont('600'),
  },
});
