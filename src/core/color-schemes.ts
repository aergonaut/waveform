export interface ColorScheme {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
}

export const colorSchemes: Record<string, ColorScheme> = {
  classic: {
    name: 'Classic iTunes',
    primary: '#8B5CF6',
    secondary: '#3B82F6',
    accent: '#6366F1',
    background: '#000000'
  },
  sunset: {
    name: 'Sunset',
    primary: '#FB923C',
    secondary: '#F472B6',
    accent: '#EC4899',
    background: '#000000'
  },
  matrix: {
    name: 'Matrix',
    primary: '#22C55E',
    secondary: '#10B981',
    accent: '#14532D',
    background: '#000000'
  },
  rainbow: {
    name: 'Rainbow',
    primary: '#EF4444',
    secondary: '#8B5CF6',
    accent: '#3B82F6',
    background: '#000000'
  },
  monochrome: {
    name: 'Monochrome',
    primary: '#FFFFFF',
    secondary: '#9CA3AF',
    accent: '#6B7280',
    background: '#000000'
  }
};

export type ColorSchemeName = keyof typeof colorSchemes;

export const colorSchemeKeys: ColorSchemeName[] = ['classic', 'sunset', 'matrix', 'rainbow', 'monochrome'];

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 255, g: 255, b: 255 };
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

export function lerpColor(color1: string, color2: string, t: number): string {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  const r = rgb1.r + (rgb2.r - rgb1.r) * t;
  const g = rgb1.g + (rgb2.g - rgb1.g) * t;
  const b = rgb1.b + (rgb2.b - rgb1.b) * t;

  return rgbToHex(r, g, b);
}
