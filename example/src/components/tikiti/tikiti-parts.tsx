import {
  useEffect,
  useState,
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
  type TextInputProps,
} from 'react-native';
import MapView, { Marker, Polyline, type LatLng } from 'react-native-maps';
import { Tray, useTray } from 'morphlet';

import { sfFont } from '../../utils';
import { TrayCloseButton, TrayIconButton } from '../artist/artist-tray-parts';
import { SymbolView, type SFSymbol } from '../symbol-view';
import { dateParts, regionFor, routeBetween, type IVenue } from './tikiti.data';
import { DARK_MAP_STYLE, tikitiColors } from './tikiti.theme';

export const tikitiType = {
  title: { fontSize: 20, ...sfFont('700'), color: tikitiColors.text },
  headline: { fontSize: 17, ...sfFont('600'), color: tikitiColors.text },
  body: { fontSize: 16, ...sfFont(), color: tikitiColors.text },
  caption: { fontSize: 13, ...sfFont(), color: tikitiColors.textSecondary },
  eyebrow: { fontSize: 12, ...sfFont('700'), color: tikitiColors.accent },
  section: {
    fontSize: 14,
    ...sfFont('600'),
    color: tikitiColors.textSecondary,
  },
  total: { fontSize: 26, ...sfFont('700'), color: tikitiColors.text },
} as const;

interface IHeaderView {
  title: string;
  back?: boolean;
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
            <TrayIconButton icon="chevron.left" label="Back" onPress={goBack} />
          )}
          <Tray.Title style={tikitiType.title} numberOfLines={1}>
            {current.title}
          </Tray.Title>
        </View>
      </Tray.Morph>
      <TrayCloseButton />
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
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      {icon && (
        <SymbolView
          name={icon}
          size={15}
          weight="semibold"
          tintColor={tikitiColors.text}
        />
      )}
      <Text style={tikitiType.headline}>{label}</Text>
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
        <Text style={tikitiType.headline} numberOfLines={1}>
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
}

export function Field({ icon, prefix, divider, style, ...rest }: IFieldProps) {
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
    </View>
  );
}

export interface IMapPin {
  coordinate: LatLng;
  icon: SFSymbol;
  color?: string;
}

interface IPinMapProps {
  pins: IMapPin[];
  /** Draws the rider's position and a route from it to the first pin. */
  origin?: LatLng;
  height?: number;
}

// Custom marker views are rasterised on Android; keep tracking changes just
// long enough to render them, then freeze for performance.
function useTracksViewChanges() {
  const [tracks, setTracks] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setTracks(false), 800);
    return () => clearTimeout(timer);
  }, []);
  return Platform.OS === 'android' ? tracks : false;
}

export function PinMap({ pins, origin, height = 150 }: IPinMapProps) {
  const points = pins.map((pin) => pin.coordinate);
  const region = regionFor(origin ? [origin, ...points] : points);
  const tracksViewChanges = useTracksViewChanges();
  const target = pins[0];

  return (
    <View style={[styles.map, { height }]}>
      <MapView
        style={StyleSheet.absoluteFill}
        region={region}
        userInterfaceStyle="dark"
        customMapStyle={DARK_MAP_STYLE}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        toolbarEnabled={false}
        showsPointsOfInterests={false}
      >
        {origin && target && (
          <>
            <Polyline
              coordinates={routeBetween(origin, target.coordinate)}
              strokeColor={tikitiColors.accent}
              strokeWidth={4}
              lineCap="round"
            />
            <Marker
              coordinate={origin}
              anchor={{ x: 0.5, y: 0.5 }}
              tracksViewChanges={tracksViewChanges}
            >
              <View style={styles.origin} />
            </Marker>
          </>
        )}
        {pins.map((pin, index) => (
          <Marker
            key={`${pin.coordinate.latitude},${pin.coordinate.longitude}`}
            coordinate={pin.coordinate}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={tracksViewChanges}
            zIndex={pins.length - index}
          >
            <View
              style={[
                styles.pin,
                { backgroundColor: pin.color ?? tikitiColors.accent },
              ]}
            >
              <SymbolView
                name={pin.icon}
                size={13}
                weight="semibold"
                tintColor={tikitiColors.text}
              />
            </View>
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

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
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
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
    borderColor: tikitiColors.accent,
    backgroundColor: tikitiColors.accent,
  },
  date: {
    width: 36,
    alignItems: 'center',
  },
  dateWeekday: {
    fontSize: 10,
    ...sfFont('700'),
    color: tikitiColors.accent,
  },
  dateDay: {
    fontSize: 20,
    ...sfFont('700'),
    color: tikitiColors.text,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 4,
    borderRadius: 20,
    backgroundColor: tikitiColors.card,
  },
  step: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tikitiColors.cardPressed,
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
  },
  map: {
    overflow: 'hidden',
    borderRadius: 18,
    borderCurve: 'continuous',
    backgroundColor: tikitiColors.card,
  },
  origin: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: tikitiColors.text,
    backgroundColor: '#0A84FF',
  },
  pin: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: tikitiColors.text,
    backgroundColor: tikitiColors.accent,
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
