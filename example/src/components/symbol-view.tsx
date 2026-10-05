import { Platform, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import {
  SymbolView as ExpoSymbolView,
  type AndroidSymbol,
  type SFSymbol,
  type SymbolViewProps,
} from 'expo-symbols';
import semiBold from 'expo-symbols/androidWeights/semiBold';

import { SYMBOL_IMAGES } from './symbol-images';

const ANDROID_CHROME = new Set<SFSymbol>([
  'ellipsis',
  'square.and.arrow.up',
  'chevron.left',
]);

const MATERIAL_NAMES: Partial<Record<SFSymbol, string>> = {
  'chevron.left': 'arrow_back',
  'chevron.right': 'chevron_right',
  'arrow.left': 'arrow_back',
  'arrow.up': 'arrow_upward',
  'arrow.down': 'arrow_downward',
  'arrow.up.right': 'north_east',
  'arrow.up.forward.app': 'open_in_new',
  'arrow.up.left.and.arrow.down.right': 'open_in_full',
  'arrow.down.right.and.arrow.up.left': 'close_fullscreen',
  'arrow.uturn.backward.circle': 'undo',
  'arrow.left.arrow.right.circle': 'swap_horiz',
  'arrow.triangle.turn.up.right.diamond.fill': 'directions',
  'xmark': 'close',
  'ellipsis': 'more_vert',
  'square.and.arrow.up': 'share',
  'square.and.pencil': 'edit_square',
  'pencil': 'edit',
  'plus': 'add',
  'minus': 'remove',
  'checkmark': 'check',
  'checkmark.circle.fill': 'check_circle',
  'checkmark.seal.fill': 'verified',
  'checkmark.shield': 'verified_user',
  'line.3.horizontal.decrease': 'filter_list',
  'info.circle': 'info',
  'info': 'info_i',
  'questionmark.circle': 'help',
  'exclamationmark.circle': 'error',
  'exclamationmark.triangle': 'warning',
  'circle.dotted': 'radio_button_unchecked',
  'flag': 'flag',
  'faceid': 'face',

  'play.fill': 'play_arrow',
  'play': 'play_arrow',
  'pause.fill': 'pause',
  'forward.fill': 'fast_forward',
  'shuffle': 'shuffle',
  'house.fill': 'home',
  'square.grid.2x2.fill': 'grid_view',
  'dot.radiowaves.left.and.right': 'radio',
  'music.note.square.stack.fill': 'library_music',
  'magnifyingglass': 'search',
  'e.square.fill': 'explicit',
  'star': 'star',
  'star.fill': 'star',
  'star.slash': 'star_border',
  'heart.fill': 'favorite',
  'heart': 'favorite',
  'sparkles': 'auto_awesome',
  'wand.and.stars': 'auto_fix_high',

  'map': 'map',
  'map.fill': 'map',
  'mappin.and.ellipse': 'location_on',
  'location.fill': 'near_me',
  'car.fill': 'directions_car',
  'figure.walk': 'directions_walk',
  'tram.fill': 'tram',
  'scooter': 'two_wheeler',
  'bus.fill': 'directions_bus',
  'car.2.fill': 'airport_shuttle',
  'car.side.fill': 'electric_rickshaw',
  'airplane': 'flight',
  'ferry.fill': 'directions_boat',
  'train.side.front.car': 'train',
  'chevron.down': 'expand_more',
  'iphone': 'smartphone',
  'banknote.fill': 'payments',
  'building.2.fill': 'apartment',
  'building.columns.fill': 'account_balance',
  'bag.fill': 'shopping_bag',
  'cart.fill': 'shopping_cart',
  'fork.knife': 'restaurant',
  'sportscourt.fill': 'stadium',
  'binoculars.fill': 'pets',
  'tree.fill': 'park',
  'beach.umbrella.fill': 'beach_access',
  'mountain.2.fill': 'landscape',
  'cross.case.fill': 'local_hospital',
  'ticket.fill': 'confirmation_number',
  'bed.double.fill': 'hotel',
  'tent.fill': 'camping',
  'steeringwheel': 'drive_eta',
  'phone.fill': 'call',
  'wallet.pass': 'wallet',
  'person.fill': 'person',
  'person.2': 'group',
  'person.2.fill': 'group',
  'person.3.fill': 'groups',
  'person.badge.plus': 'person_add',
  'person.crop.circle.badge.xmark': 'person_remove',
  'envelope.fill': 'mail',
  'paperplane.fill': 'send',
  'text.bubble': 'chat_bubble',
  'clock.fill': 'schedule',
  'stopwatch.fill': 'timer',

  'bolt.fill': 'bolt',
  'book.fill': 'menu_book',
  'bookmark.fill': 'bookmark',
  'crown.fill': 'crown',
  'figure.fencing': 'sports_martial_arts',
  'folder.badge.plus': 'create_new_folder',
  'folder.fill': 'folder',
  'leaf.fill': 'eco',
  'moon.stars.fill': 'bedtime',
  'paintpalette.fill': 'palette',
  'rectangle.grid.3x3': 'grid_on',
  'shield.lefthalf.filled': 'shield',
  'square.grid.3x3.fill': 'apps',
  'square.split.1x2.fill': 'splitscreen',
  'circle.grid.2x2.fill': 'apps',
  'widget.large': 'widgets',
};

const HEAVY_WEIGHTS = new Set(['semibold', 'bold', 'heavy', 'black']);

export function materialNameFor(name: SFSymbol): AndroidSymbol | undefined {
  return MATERIAL_NAMES[name] as AndroidSymbol | undefined;
}

export function SymbolView({ name, weight, ...rest }: SymbolViewProps) {
  if (Platform.OS !== 'android' || typeof name !== 'string') {
    return <ExpoSymbolView name={name} weight={weight} {...rest} />;
  }

  const isHeavy = typeof weight === 'string' && HEAVY_WEIGHTS.has(weight);
  const image = ANDROID_CHROME.has(name) ? undefined : SYMBOL_IMAGES[name];
  if (image) {
    const size = rest.size ?? 24;
    return (
      <View style={[styles.symbol, { width: size, height: size }, rest.style]}>
        <Image
          source={isHeavy ? image.semibold : image.regular}
          tintColor={
            typeof rest.tintColor === 'string' ? rest.tintColor : '#FFFFFF'
          }
          contentFit="contain"
          style={StyleSheet.absoluteFill}
        />
      </View>
    );
  }

  const android = materialNameFor(name);
  return (
    <ExpoSymbolView
      name={{ ios: name, android }}
      weight={isHeavy ? { ios: weight, android: semiBold } : weight}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  symbol: {
    flexShrink: 0,
  },
});

export type { AndroidSymbol, SFSymbol, SymbolViewProps };
