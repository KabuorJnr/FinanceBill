function channels(hex: string): [number, number, number] {
  const value = parseInt(hex.replace('#', '').slice(0, 6), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

export function shade(hex: string, amount: number): string {
  const mixed = channels(hex).map((c) => Math.round(c * (1 - amount)));
  return `#${mixed.map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

export function withAlpha(hex: string, alpha: number): string {
  return `rgba(${channels(hex).join(', ')}, ${alpha})`;
}

export function tint(hex: string, amount: number): string {
  const mixed = channels(hex).map((c) => Math.round(c + (255 - c) * amount));
  return `#${mixed.map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}
