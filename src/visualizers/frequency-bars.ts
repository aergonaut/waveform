import { BaseVisualizer } from './base-visualizer';
import type { AudioData } from '../audio/types';
import type { ColorScheme } from '../core/color-schemes';
import { hexToRgb } from '../core/color-schemes';

export class FrequencyBars extends BaseVisualizer {
  name = 'Frequency Bars';
  private ctx: CanvasRenderingContext2D | null = null;
  private barCount = 32;
  private barHeights: number[] = [];
  private targetHeights: number[] = [];

  constructor(colorScheme: ColorScheme) {
    super(colorScheme);
    this.barHeights = new Array(this.barCount).fill(0);
    this.targetHeights = new Array(this.barCount).fill(0);
  }

  init(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  update(audioData: AudioData): void {
    const frequencyData = audioData.frequencyData;

    // Map frequency bins to bars logarithmically
    for (let i = 0; i < this.barCount; i++) {
      const ratio = i / this.barCount;
      const logIndex = Math.pow(ratio, 1.5) * frequencyData.length;
      const index = Math.floor(logIndex);

      // Average nearby bins for smoother visualization
      let sum = 0;
      let count = 0;
      const range = 3;

      for (let j = -range; j <= range; j++) {
        const idx = index + j;
        if (idx >= 0 && idx < frequencyData.length) {
          sum += frequencyData[idx];
          count++;
        }
      }

      this.targetHeights[i] = (sum / count) / 255;
    }
  }

  render(): void {
    if (!this.ctx || !this.canvas) return;

    const width = this.canvas.width;
    const height = this.canvas.height;

    // Clear canvas
    this.ctx.fillStyle = this.colorScheme.background;
    this.ctx.fillRect(0, 0, width, height);

    const barWidth = width / this.barCount;
    const gap = barWidth * 0.2;
    const actualBarWidth = barWidth - gap;

    // Update bar heights with smoothing
    for (let i = 0; i < this.barCount; i++) {
      this.barHeights[i] = this.lerp(this.barHeights[i], this.targetHeights[i], 0.3);
    }

    // Draw bars
    for (let i = 0; i < this.barCount; i++) {
      const barHeight = this.barHeights[i] * height * 0.8;
      const x = i * barWidth + gap / 2;
      const y = height - barHeight - height * 0.1;

      // Create gradient for bar
      const gradient = this.ctx.createLinearGradient(x, y + barHeight, x, y);
      gradient.addColorStop(0, this.colorScheme.primary);
      gradient.addColorStop(1, this.colorScheme.secondary);

      this.ctx.fillStyle = gradient;

      // Draw rounded rectangle
      this.drawRoundedRect(x, y, actualBarWidth, barHeight, 3);

      // Draw reflection
      const reflectionGradient = this.ctx.createLinearGradient(
        x,
        height - height * 0.1,
        x,
        height - height * 0.1 + barHeight * 0.3
      );
      reflectionGradient.addColorStop(0, this.addAlpha(this.colorScheme.primary, 0.3));
      reflectionGradient.addColorStop(1, this.addAlpha(this.colorScheme.primary, 0));

      this.ctx.fillStyle = reflectionGradient;
      this.drawRoundedRect(
        x,
        height - height * 0.1,
        actualBarWidth,
        barHeight * 0.3,
        3
      );
    }
  }

  resize(width: number, height: number): void {
    if (this.canvas) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
  }

  private drawRoundedRect(x: number, y: number, width: number, height: number, radius: number): void {
    if (!this.ctx) return;

    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height);
    this.ctx.lineTo(x, y + height);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
    this.ctx.fill();
  }

  private addAlpha(hex: string, alpha: number): string {
    const rgb = hexToRgb(hex);
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  }

  dispose(): void {
    super.dispose();
    this.ctx = null;
  }
}
