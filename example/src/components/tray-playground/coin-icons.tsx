import Svg, { Circle, Path, Text } from 'react-native-svg';

interface ICoinIconProps {
  size?: number;
}

function Monogram({
  size = 34,
  color,
  letter,
}: ICoinIconProps & { color: string; letter: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Circle cx={16} cy={16} r={16} fill={color} />
      <Text
        x={16}
        y={21.5}
        fill="#FFF"
        fontSize={16}
        fontWeight="800"
        textAnchor="middle"
      >
        {letter}
      </Text>
    </Svg>
  );
}

export function MpesaIcon({ size }: ICoinIconProps) {
  return <Monogram size={size} color="#2FA84F" letter="M" />;
}

export function AirtelMoneyIcon({ size }: ICoinIconProps) {
  return <Monogram size={size} color="#E2231A" letter="A" />;
}

export function BankIcon({ size = 34 }: ICoinIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Circle cx={16} cy={16} r={16} fill="#0A0A0A" />
      <Path
        fill="#FFF"
        d="M16 7.5 7.5 12v2h17v-2L16 7.5zM9.5 15.5v6h2v-6h-2zm4.5 0v6h2v-6h-2zm4.5 0v6h2v-6h-2zm4 0v6h2v-6h-2zM7.5 23v2h17v-2h-17z"
      />
    </Svg>
  );
}
