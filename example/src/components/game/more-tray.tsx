import { memo, useState } from 'react';
import { Keyboard, Share, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Tray, useTray } from 'morphlet';

import { artistColors } from '../artist/artist.theme';
import { GlassCircleButton } from '../artist/artist-glass-button';
import {
  TrayButton,
  TrayFact,
  TrayGroup,
  TrayRow,
  trayStyles,
} from '../artist/artist-tray-parts';
import type { IGame } from './game.data';
import { formatCount, gameColors } from './game.theme';
import { GameTrayHeader, TrayChips, TrayTextArea } from './game-tray-parts';
import { ThanksView } from './review-compose';

type TReason = 'bug' | 'performance' | 'content' | 'other';

const REASONS: { value: TReason; label: string }[] = [
  { value: 'bug', label: 'Bug' },
  { value: 'performance', label: 'Performance' },
  { value: 'content', label: 'Inappropriate' },
  { value: 'other', label: 'Other' },
];

interface IMoreTrayProps {
  game: IGame;
  size: number;
}

export const MoreTray = memo(function MoreTray({ game, size }: IMoreTrayProps) {
  const [wishlisted, setWishlisted] = useState(false);

  return (
    <Tray.Root defaultView="menu">
      <Tray.Trigger asChild morph>
        <GlassCircleButton
          icon="ellipsis"
          label="More"
          scheme="dark"
          size={size}
        />
      </Tray.Trigger>

      <Tray.Content backgroundColor={gameColors.sheet}>
        <GameTrayHeader
          title={game.title}
          subtitle={`by ${game.creator}`}
          leading={
            <Image
              source={{ uri: game.avatar }}
              transition={200}
              style={styles.avatar}
            />
          }
          views={{
            info: { title: 'Game Info' },
            report: { title: 'Report a Problem' },
            reported: { title: 'Report Sent', back: false },
          }}
        />
        <Tray.Body>
          <Tray.View name="menu">
            <MenuView
              game={game}
              wishlisted={wishlisted}
              onWishlist={() => setWishlisted((value) => !value)}
            />
          </Tray.View>
          <Tray.View name="info">
            <InfoView game={game} />
          </Tray.View>
          <Tray.View name="report">
            <ReportView />
          </Tray.View>
          <Tray.View name="reported">
            <ThanksView message="Thanks for letting us know. The team will take a look." />
          </Tray.View>
        </Tray.Body>
      </Tray.Content>
    </Tray.Root>
  );
});

interface IMenuViewProps {
  game: IGame;
  wishlisted: boolean;
  onWishlist: () => void;
}

function MenuView({ game, wishlisted, onWishlist }: IMenuViewProps) {
  const { setView } = useTray();

  return (
    <View style={trayStyles.page}>
      <TrayGroup>
        <TrayRow
          icon="square.and.arrow.up"
          title="Share Game"
          onPress={() =>
            void Share.share({
              message: `Play ${game.title} with me. ${game.description}`,
            })
          }
        />
        <Tray.Morph value={wishlisted} transition="fade">
          <TrayRow
            icon={wishlisted ? 'bookmark.fill' : 'bookmark'}
            title={wishlisted ? 'On Your Wishlist' : 'Add to Wishlist'}
            onPress={onWishlist}
          />
        </Tray.Morph>
      </TrayGroup>

      <TrayGroup>
        <TrayRow
          icon="info.circle"
          title="Game Info"
          navigates
          onPress={() => setView('info')}
        />
        <TrayRow
          icon="flag"
          title="Report a Problem"
          navigates
          onPress={() => setView('report')}
        />
      </TrayGroup>
    </View>
  );
}

function InfoView({ game }: { game: IGame }) {
  return (
    <View style={trayStyles.page}>
      <TrayGroup>
        <TrayFact label="Creator" value={game.creator} />
        <TrayFact
          label="Genre"
          value={game.tags.map((tag) => tag.label).join(', ')}
        />
        <TrayFact label="Released" value={game.released} />
        <TrayFact label="Size" value={game.size} />
        <TrayFact label="Plays" value={formatCount(game.plays, 'K')} />
      </TrayGroup>
    </View>
  );
}

function ReportView() {
  const { setView } = useTray();
  const [reason, setReason] = useState<TReason>('bug');
  const [details, setDetails] = useState('');

  return (
    <View style={trayStyles.page}>
      <View style={styles.block}>
        <Text style={styles.label}>What’s wrong?</Text>
        <TrayChips options={REASONS} selected={[reason]} onPress={setReason} />
      </View>

      <TrayTextArea
        placeholder="Tell us what happened…"
        value={details}
        onChangeText={setDetails}
      />

      <TrayButton
        label="Send Report"
        icon="paperplane.fill"
        onPress={() => {
          Keyboard.dismiss();
          setView('reported');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: artistColors.card,
  },
  block: {
    gap: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    color: artistColors.textTertiary,
  },
});
