import type { AudioData } from '../audio/types';
import type { ColorScheme } from '../core/color-schemes';

export interface Visualizer {
  name: string;
  init(canvas: HTMLCanvasElement): void;
  update(audioData: AudioData): void;
  render(): void;
  resize(width: number, height: number): void;
  setColorScheme(colorScheme: ColorScheme): void;
  dispose(): void;
}
