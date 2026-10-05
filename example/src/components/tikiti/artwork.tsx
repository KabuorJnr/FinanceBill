import { memo } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Path, Polygon, Rect } from 'react-native-svg';

// Solid-colour artwork in the spirit of kitenge and kanga prints: Kenyan
// flag colours, Maasai beadwork bands and a shield motif. Each seed gives a
// different arrangement, so songs and releases get their own covers.

const PALETTES = [
  ['#BB0000', '#0A0A0A', '#006B3F', '#F4EDE4', '#E8A33D'],
  ['#006B3F', '#0A0A0A', '#BB0000', '#F4EDE4', '#2F7FC1'],
  ['#E8A33D', '#BB0000', '#0A0A0A', '#F4EDE4', '#006B3F'],
  ['#2F7FC1', '#0A0A0A', '#E8A33D', '#F4EDE4', '#BB0000'],
] as const;

function rng(seed: string) {
  let state = 2166136261;
  for (let index = 0; index < seed.length; index++) {
    state = Math.imul(state ^ seed.charCodeAt(index), 16777619);
  }
  return () => {
    state = Math.imul(state ^ (state >>> 13), 1274126177);
    return ((state ^ (state >>> 16)) >>> 0) / 4294967296;
  };
}

interface IArtworkProps {
  seed: string;
  size?: number;
  width?: number;
  height?: number;
  radius?: number;
  /** Larger, calmer layout for the artist header. */
  hero?: boolean;
  style?: StyleProp<ViewStyle>;
}

function ArtworkView({
  seed,
  size = 48,
  width = size,
  height = size,
  radius = 6,
  hero = false,
  style,
}: IArtworkProps) {
  const random = rng(seed);
  const palette = PALETTES[Math.floor(random() * PALETTES.length)]!;
  const [base, ink, accent, cream, highlight] = palette;
  const w = 100;
  const h = hero ? Math.round((100 * height) / width) : 100;

  // Beadwork bands: rows of small squares in alternating colours.
  const bandY = hero ? h * 0.12 : 70;
  const beads = Array.from({ length: 10 }, (_, index) => ({
    x: index * 10,
    color: [ink, cream, accent, cream, highlight][index % 5]!,
  }));

  return (
    <View
      style={[
        { width, height, borderRadius: radius, overflow: 'hidden' },
        style,
      ]}
    >
      <Svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`}>
        <Rect width={w} height={h} fill={base} />
        {/* Large sun circles, kanga style. */}
        <Circle
          cx={20 + random() * 60}
          cy={hero ? h * 0.42 : 38}
          r={hero ? 34 : 30}
          fill={ink}
        />
        <Circle
          cx={20 + random() * 60}
          cy={hero ? h * 0.42 : 38}
          r={hero ? 22 : 18}
          fill={accent}
        />
        <Circle
          cx={50}
          cy={hero ? h * 0.42 : 38}
          r={hero ? 9 : 8}
          fill={cream}
        />
        {/* Maasai shield: a tall lens with a centre stripe. */}
        <Path
          d={
            hero
              ? `M78 ${h * 0.16} Q92 ${h * 0.42} 78 ${h * 0.68} Q64 ${h * 0.42} 78 ${h * 0.16} Z`
              : 'M80 8 Q94 36 80 64 Q66 36 80 8 Z'
          }
          fill={cream}
        />
        <Rect
          x={77}
          y={hero ? h * 0.18 : 10}
          width={6}
          height={hero ? h * 0.48 : 52}
          fill={base}
        />
        {/* Triangles along the lower edge. */}
        {Array.from({ length: 5 }, (_, index) => (
          <Polygon
            key={index}
            points={`${index * 20},${h} ${index * 20 + 10},${h - 14} ${index * 20 + 20},${h}`}
            fill={index % 2 ? ink : cream}
          />
        ))}
        {beads.map((bead) => (
          <Rect
            key={bead.x}
            x={bead.x}
            y={bandY}
            width={10}
            height={4}
            fill={bead.color}
          />
        ))}
      </Svg>
    </View>
  );
}

export const Artwork = memo(ArtworkView);
