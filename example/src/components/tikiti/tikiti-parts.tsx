import { type ComponentRef, type ReactNode, type Ref } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { Tray, useTray } from 'morphlet';

import { sfFont } from '../../utils';
import { SymbolView, type SFSymbol } from '../symbol-view';
import { PinMap } from './pin-map';
import {
  categoryOf,
  displayName,
  initialsOf,
  type IEvent,
} from './events.data';
import { dateParts, type IVenue } from './tikiti.data';
import { tikitiColors } from './tikiti.theme';

export const tikitiType = {
  title: { fontSize: 20, ...sfFont('700'), color: tikitiColors.text },
  headline: { fontSize: 17, ...sfFont('600'), color: tikitiColors.text },
  body: { fontSize: 16, ...sfFont(), color: tikitiColors.text },
  caption: { fontSize: 13, ...sfFont(), color: tikitiColors.textSecondary },
  eyebrow: {
    fontSize: 12,
    ...sfFont('700'),
    color: tikitiColors.accentBright,
  },
  section: {
    fontSize: 14,
    ...sfFont('600'),
    color: tikitiColors.textSecondary,
  },
  total: { fontSize: 26, ...sfFont('700'), color: tikitiColors.text },
} as const;

interface IHeaderView {
  title: string;
  subtitle?: string;
  back?: boolean;
}

/** The reference's solid round header buttons. */
export function CircleButton({
  icon,
  label,
  onPress,
  ref,
  ...rest
}: {
  icon: SFSymbol;
  label: string;
  onPress?: () => void;
  ref?: Ref<ComponentRef<typeof Pressable>>;
}) {
  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      onPress={onPress}
      {...rest}
      style={({ pressed }) => [styles.circle, pressed && styles.pressed]}
    >
      <SymbolView
        name={icon}
        size={13}
        weight="bold"
        tintColor={tikitiColors.text}
      />
    </Pressable>
  );
}

export function TikitiHeader({
  views,
}: {
  views: Record<string, IHeaderView>;
}) {
  const { view, goBack, canGoBack } = useTray();
  const current = (view && views[view]) || { title: '' };
  const showBack = current.back ?? canGoBack;

  return (
    <Tray.Header style={styles.header}>
      <Tray.Morph value={view ?? ''} style={styles.heading}>
        <View style={styles.headingRow}>
          {showBack && (
            <CircleButton icon="chevron.left" label="Back" onPress={goBack} />
          )}
          <View style={styles.headingText}>
            <Tray.Title style={tikitiType.title} numberOfLines={1}>
              {current.title}
            </Tray.Title>
            {!!current.subtitle && (
              <Text style={tikitiType.caption} numberOfLines={1}>
                {current.subtitle}
              </Text>
            )}
          </View>
        </View>
      </Tray.Morph>
      <Tray.Close asChild>
        <CircleButton icon="xmark" label="Close" />
      </Tray.Close>
    </Tray.Header>
  );
}

interface IButtonProps {
  label: string;
  icon?: SFSymbol;
  variant?: 'accent' | 'secondary';
  disabled?: boolean;
  onPress?: () => void;
  ref?: Ref<ComponentRef<typeof Pressable>>;
}

export function TikitiButton({
  label,
  icon,
  variant = 'accent',
  disabled = false,
  onPress,
  ref,
}: IButtonProps) {
  const isAccent = variant === 'accent';
  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isAccent ? styles.buttonAccent : styles.buttonSecondary,
        disabled && styles.buttonDisabled,
        pressed && styles.pressed,
      ]}
    >
      {icon && (
        <SymbolView
          name={icon}
          size={15}
          weight="semibold"
          tintColor={disabled ? tikitiColors.textSecondary : tikitiColors.text}
        />
      )}
      <Text style={[tikitiType.headline, disabled && styles.textDisabled]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Group({ children }: { children: ReactNode }) {
  return <View style={styles.group}>{children}</View>;
}

interface IListRowProps {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  selected?: boolean;
  divider?: boolean;
  chevron?: boolean;
  /** Greyed title, e.g. a placeholder value. */
  muted?: boolean;
  onPress?: () => void;
}

export function ListRow({
  title,
  subtitle,
  leading,
  trailing,
  selected,
  divider,
  chevron,
  muted,
  onPress,
}: IListRowProps) {
  return (
    <Pressable
      accessibilityRole={selected === undefined ? 'button' : 'radio'}
      accessibilityState={selected === undefined ? undefined : { selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        divider && styles.rowDivider,
        selected && styles.rowSelected,
        pressed && !selected && styles.rowPressed,
      ]}
    >
      {leading}
      <View style={styles.rowText}>
        <Text
          style={[tikitiType.headline, muted && styles.mutedTitle]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {!!subtitle && (
          <Text style={tikitiType.caption} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
      {trailing}
      {chevron && (
        <SymbolView
          name="chevron.right"
          size={12}
          weight="semibold"
          tintColor={tikitiColors.textTertiary}
        />
      )}
    </Pressable>
  );
}

export function Radio({ selected }: { selected: boolean }) {
  return selected ? (
    <View style={[styles.radio, styles.radioOn]}>
      <SymbolView
        name="checkmark"
        size={11}
        weight="bold"
        tintColor={tikitiColors.text}
      />
    </View>
  ) : (
    <View style={styles.radio} />
  );
}

export function DateBlock({ date }: { date: string }) {
  const { weekday, day } = dateParts(date);
  return (
    <View style={styles.date}>
      <Text style={styles.dateWeekday}>{weekday}</Text>
      <Text style={styles.dateDay}>{day}</Text>
    </View>
  );
}

/** Month and day in a rounded tile, as on the reference's concert card. */
export function DateTile({ date }: { date: string }) {
  const { monthShort, day } = dateParts(date);
  return (
    <View style={styles.tile}>
      <Text style={styles.tileMonth}>{monthShort.toUpperCase()}</Text>
      <Text style={styles.tileDay}>{day}</Text>
    </View>
  );
}

interface IStepperProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

export function Stepper({ value, min, max, onChange }: IStepperProps) {
  return (
    <View style={styles.stepper}>
      <StepButton
        icon="minus"
        label="Fewer"
        disabled={value <= min}
        onPress={() => onChange(value - 1)}
      />
      <Tray.Morph value={value} transition="scale">
        <Text style={[tikitiType.headline, styles.stepValue]}>{value}</Text>
      </Tray.Morph>
      <StepButton
        icon="plus"
        label="More"
        disabled={value >= max}
        onPress={() => onChange(value + 1)}
      />
    </View>
  );
}

function StepButton({
  icon,
  label,
  disabled,
  onPress,
}: {
  icon: SFSymbol;
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => [
        styles.step,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <SymbolView
        name={icon}
        size={13}
        weight="bold"
        tintColor={tikitiColors.text}
      />
    </Pressable>
  );
}

interface IFieldProps extends TextInputProps {
  icon: SFSymbol;
  prefix?: string;
  divider?: boolean;
  trailing?: ReactNode;
}

export function Field({
  icon,
  prefix,
  divider,
  trailing,
  style,
  ...rest
}: IFieldProps) {
  return (
    <View style={[styles.field, divider && styles.rowDivider]}>
      <SymbolView
        name={icon}
        size={15}
        weight="medium"
        tintColor={tikitiColors.textSecondary}
        style={styles.fieldIcon}
      />
      {!!prefix && <Text style={tikitiType.body}>{prefix}</Text>}
      <TextInput
        placeholderTextColor={tikitiColors.textTertiary}
        selectionColor={tikitiColors.accent}
        keyboardAppearance="dark"
        style={[tikitiType.body, styles.input, style]}
        {...rest}
      />
      {trailing}
    </View>
  );
}

export { PinMap, type IMapPin } from './pin-map';

export function VenueMap({
  venue,
  showRoute,
  height,
}: {
  venue: IVenue;
  showRoute?: boolean;
  height?: number;
}) {
  return (
    <PinMap
      pins={[{ coordinate: venue.coordinate, icon: 'ticket.fill' }]}
      origin={showRoute ? venue.city.origin.coordinate : undefined}
      height={height}
    />
  );
}

/** The Kenyan flag as solid bands: black, red and green with white edges. */
export function KenyaBand({ height = 14 }: { height?: number }) {
  // Three solid bands with white edges, in the flag's 6:1 proportion.
  const size = { height };
  const edge = { height: height / 14 };
  return (
    <View style={size} accessibilityElementsHidden>
      <View style={[styles.band, styles.bandBlack]} />
      <View style={[styles.edge, edge]} />
      <View style={[styles.band, styles.bandRed]} />
      <View style={[styles.edge, edge]} />
      <View style={[styles.band, styles.bandGreen]} />
    </View>
  );
}

export function ArtistAvatar({
  size,
  event,
  label,
}: {
  size: number;
  event?: IEvent;
  label?: string;
}) {
  const text = label ?? (event ? displayName(event) : '');
  return (
    <View
      style={[
        styles.artistAvatar,
        { width: size, height: size, borderRadius: size / 4 },
        event && { backgroundColor: categoryOf(event.category).color },
      ]}
    >
      <Text style={[tikitiType.headline, { fontSize: size * 0.34 }]}>
        {initialsOf(text)}
      </Text>
    </View>
  );
}

export function NumberPlate({ plate }: { plate: string }) {
  return (
    <View style={styles.plate}>
      <Text style={styles.plateText}>{plate}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 6,
  },
  heading: {
    flex: 1,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 34,
  },
  headingText: {
    flex: 1,
    gap: 1,
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tikitiColors.control,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    minHeight: 50,
    borderRadius: 25,
  },
  buttonAccent: {
    backgroundColor: tikitiColors.accent,
  },
  buttonSecondary: {
    backgroundColor: tikitiColors.card,
  },
  disabled: {
    opacity: 0.4,
  },
  buttonDisabled: {
    backgroundColor: tikitiColors.disabled,
  },
  textDisabled: {
    color: tikitiColors.textSecondary,
  },
  mutedTitle: {
    ...sfFont(),
    color: tikitiColors.textSecondary,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
  group: {
    overflow: 'hidden',
    borderRadius: 18,
    borderCurve: 'continuous',
    backgroundColor: tikitiColors.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 58,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  rowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: tikitiColors.separator,
  },
  rowSelected: {
    backgroundColor: tikitiColors.accentTint,
  },
  rowPressed: {
    backgroundColor: tikitiColors.cardPressed,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: tikitiColors.textTertiary,
  },
  radioOn: {
    borderColor: tikitiColors.accentBright,
    backgroundColor: tikitiColors.accentBright,
  },
  date: {
    width: 36,
    alignItems: 'center',
  },
  tile: {
    width: 46,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderCurve: 'continuous',
    backgroundColor: tikitiColors.control,
  },
  tileMonth: {
    fontSize: 11,
    ...sfFont('700'),
    color: tikitiColors.accentBright,
  },
  tileDay: {
    fontSize: 21,
    ...sfFont('700'),
    color: tikitiColors.text,
  },
  dateWeekday: {
    fontSize: 10,
    ...sfFont('700'),
    color: tikitiColors.accentBright,
  },
  dateDay: {
    fontSize: 20,
    ...sfFont('700'),
    color: tikitiColors.text,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  step: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tikitiColors.control,
  },
  stepValue: {
    minWidth: 24,
    textAlign: 'center',
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 50,
    paddingHorizontal: 14,
  },
  fieldIcon: {
    width: 20,
    height: 20,
  },
  input: {
    flex: 1,
    paddingVertical: 13,
    // Browsers draw a focus box around inputs; the row already shows focus.
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : {}),
  },
  band: {
    flex: 2,
  },
  bandBlack: {
    backgroundColor: tikitiColors.kenyaBlack,
  },
  bandRed: {
    backgroundColor: tikitiColors.kenyaRed,
  },
  bandGreen: {
    backgroundColor: tikitiColors.kenyaGreen,
  },
  edge: {
    backgroundColor: tikitiColors.text,
  },
  artistAvatar: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tikitiColors.kenyaRed,
  },
  // Kenyan rear number plates are yellow with black characters.
  plate: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: tikitiColors.kenyaBlack,
    backgroundColor: tikitiColors.plate,
  },
  plateText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: tikitiColors.kenyaBlack,
  },
});
