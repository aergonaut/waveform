import type { Visualizer } from './types';
import type { AudioData } from '../audio/types';
import type { ColorScheme } from '../core/color-schemes';

export abstract class BaseVisualizer implements Visualizer {
  abstract name: string;
  protected canvas: HTMLCanvasElement | null = null;
  protected colorScheme: ColorScheme;

  constructor(colorScheme: ColorScheme) {
    this.colorScheme = colorScheme;
  }

  abstract init(canvas: HTMLCanvasElement): void;
  abstract update(audioData: AudioData): void;
  abstract render(): void;
  abstract resize(width: number, height: number): void;

  setColorScheme(colorScheme: ColorScheme): void {
    this.colorScheme = colorScheme;
  }

  dispose(): void {
    this.canvas = null;
  }

  protected lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
  }

  protected clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }
}
