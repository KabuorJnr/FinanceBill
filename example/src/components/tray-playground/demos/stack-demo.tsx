import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Tray, useTray } from 'morphlet';

import {
  CircleButton,
  PillButton,
  PlaygroundTrayHeader,
  TrayAlertHeader,
  TrayBadge,
  playgroundTrayStyles as s,
} from '../playground-tray-parts';
import { SlidingCheck } from '../animated-check';
import { AirtelMoneyIcon, BankIcon, MpesaIcon } from '../coin-icons';
import { formatKES, sendMoneyCost } from '../../tikiti/tikiti.data';
import {
  TRAY_CONTENT,
  playgroundColors,
  playgroundType,
  type IPlaygroundSettings,
} from '../playground.theme';

const ASSETS = [
  { id: 'mpesa', name: 'M-Pesa', balance: 12450, Icon: MpesaIcon },
  { id: 'airtel', name: 'Airtel Money', balance: 3200, Icon: AirtelMoneyIcon },
  { id: 'bank', name: 'Bank Account', balance: 86500, Icon: BankIcon },
];

type TAsset = (typeof ASSETS)[number];

const ASSET_ROW_HEIGHT = 60;

const SHARES = [
  { label: '25%', value: 0.25 },
  { label: '50%', value: 0.5 },
  { label: 'Max', value: 1 },
];

const RECIPIENT = 'Achieng Odhiambo';

export function StackDemo({ settings }: { settings: IPlaygroundSettings }) {
  const [asset, setAsset] = useState<TAsset>(ASSETS[0]!);

  return (
    <>
      <PlaygroundTrayHeader title="Send" />
      <Tray.Body>
        <View style={[s.article, styles.headed]}>
          <Tray.Description style={s.description}>
            Choose what you want to send.
          </Tray.Description>
          <View style={[s.group, styles.list]}>
            {ASSETS.map((option) => {
              const isSelected = option.id === asset.id;
              return (
                <Pressable
                  key={option.id}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => setAsset(option)}
                  style={styles.asset}
                >
                  <option.Icon size={36} />
                  <View style={styles.assetText}>
                    <Text style={[playgroundType.value, styles.text]}>
                      {option.name}
                    </Text>
                    <Text style={[playgroundType.caption, styles.muted]}>
                      {formatKES(option.balance)}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
            <SlidingCheck
              index={ASSETS.findIndex((option) => option.id === asset.id)}
              rowHeight={ASSET_ROW_HEIGHT}
            />
          </View>
        </View>
      </Tray.Body>
      <Tray.Footer style={s.actions}>
        <NextTray settings={settings}>
          <AmountStep asset={asset} settings={settings} />
        </NextTray>
      </Tray.Footer>
    </>
  );
}

function NextTray({
  settings,
  defaultView,
  children,
}: {
  settings: IPlaygroundSettings;
  defaultView?: string;
  children: ReactNode;
}) {
  return (
    <Tray.Root
      defaultView={defaultView}
      duration={settings.duration}
      animation={settings.spring}
    >
      <Tray.Trigger asChild morph>
        <PillButton label="Continue" icon="circle.dotted" variant="primary" />
      </Tray.Trigger>
      <Tray.Content stack {...TRAY_CONTENT}>
        {children}
      </Tray.Content>
    </Tray.Root>
  );
}

function AmountStep({
  asset,
  settings,
}: {
  asset: TAsset;
  settings: IPlaygroundSettings;
}) {
  const [share, setShare] = useState(0.25);
  const amount = asset.balance * share;

  return (
    <>
      <TrayAlertHeader icon="number" color={playgroundColors.accent} />
      <Tray.Body>
        <View style={[s.article, styles.body]}>
          <Tray.Title style={s.heading}>Amount</Tray.Title>
          <Tray.Description style={s.description}>
            How much do you want to send?
          </Tray.Description>
          <View style={styles.amount}>
            <Tray.Morph value={share} transition="scale">
              <Text style={[playgroundType.display, styles.amountValue]}>
                {formatKES(amount)}
              </Text>
            </Tray.Morph>
            <View style={styles.balance}>
              <asset.Icon size={18} />
              <Text style={[playgroundType.caption, styles.muted]}>
                of {formatKES(asset.balance)}
              </Text>
            </View>
          </View>
          <View style={styles.shares}>
            {SHARES.map((option) => {
              const isSelected = option.value === share;
              return (
                <Pressable
                  key={option.label}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => setShare(option.value)}
                  style={[styles.share, isSelected && styles.shareSelected]}
                >
                  <Text
                    style={[
                      playgroundType.value,
                      styles.shareLabel,
                      isSelected && styles.shareLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </Tray.Body>
      <Tray.Footer style={s.actions}>
        <NextTray settings={settings} defaultView="review">
          <ReviewStep asset={asset} amount={amount} />
        </NextTray>
      </Tray.Footer>
    </>
  );
}

function ReviewStep({ asset, amount }: { asset: TAsset; amount: number }) {
  return (
    <>
      <ReviewHeader />
      <Tray.Body>
        <Tray.View name="review">
          <ReviewView asset={asset} amount={amount} />
        </Tray.View>
        <Tray.View name="sent">
          <SentView asset={asset} amount={amount} />
        </Tray.View>
      </Tray.Body>
    </>
  );
}

function ReviewHeader() {
  const { view } = useTray();
  const isSent = view === 'sent';

  return (
    <Tray.Header style={styles.header}>
      <Tray.Morph value={isSent} transition="scale">
        <TrayBadge
          icon={isSent ? 'checkmark.circle.fill' : 'checkmark.seal.fill'}
          color={isSent ? playgroundColors.success : playgroundColors.accent}
        />
      </Tray.Morph>
      <Tray.Close asChild>
        <CircleButton icon="xmark" label="Close" />
      </Tray.Close>
    </Tray.Header>
  );
}

function ReviewView({ asset, amount }: { asset: TAsset; amount: number }) {
  const { setView } = useTray();
  const facts = [
    { label: 'To', value: RECIPIENT },
    { label: 'Amount', value: formatKES(amount) },
    {
      label: 'Transaction cost',
      value: `≈ ${formatKES(sendMoneyCost(amount))}`,
    },
    { label: 'From', value: asset.name },
  ];

  return (
    <View>
      <View style={[s.article, styles.body]}>
        <Tray.Title style={s.heading}>Review</Tray.Title>
        <Tray.Description style={s.description}>
          Three trays deep. Closing unwinds them one by one.
        </Tray.Description>
        <View style={[s.group, styles.list]}>
          {facts.map((fact, index) => (
            <View
              key={fact.label}
              style={[styles.fact, index > 0 && styles.factDivider]}
            >
              <Text style={[playgroundType.label, styles.muted]}>
                {fact.label}
              </Text>
              <Text style={[playgroundType.value, styles.text]}>
                {fact.value}
              </Text>
            </View>
          ))}
        </View>
      </View>
      <View style={s.actions}>
        <PillButton
          label="Send Now"
          icon="faceid"
          variant="filled"
          onPress={() => setView('sent')}
        />
      </View>
    </View>
  );
}

function SentView({ asset, amount }: { asset: TAsset; amount: number }) {
  return (
    <View>
      <View style={[s.article, styles.body]}>
        <Tray.Title style={s.heading}>On its way</Tray.Title>
        <Tray.Description style={s.description}>
          {formatKES(amount)} from {asset.name} is on its way to {RECIPIENT}.
          We’ll send you an SMS confirmation.
        </Tray.Description>
      </View>
      <View style={s.actions}>
        <Tray.Close asChild>
          <PillButton label="Done" variant="primary" />
        </Tray.Close>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  headed: {
    paddingTop: 0,
  },
  body: {
    paddingTop: 16,
  },
  list: {
    marginTop: 5,
  },
  asset: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: ASSET_ROW_HEIGHT,
    paddingLeft: 16,
    paddingRight: 44,
  },
  assetText: {
    flex: 1,
    gap: 2,
  },
  text: {
    color: playgroundColors.text,
  },
  muted: {
    color: playgroundColors.label,
  },
  amount: {
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    paddingBottom: 16,
  },
  amountValue: {
    fontSize: 48,
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
    color: playgroundColors.text,
  },
  balance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: playgroundColors.card,
  },
  shares: {
    flexDirection: 'row',
    gap: 8,
  },
  share: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: playgroundColors.card,
  },
  shareSelected: {
    backgroundColor: playgroundColors.accentTint,
  },
  shareLabel: {
    color: playgroundColors.textSecondary,
  },
  shareLabelSelected: {
    color: playgroundColors.accent,
  },
  fact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    paddingHorizontal: 16,
  },
  factDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: playgroundColors.separator,
  },
});
