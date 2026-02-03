import { BaseVisualizer } from './base-visualizer';
import type { AudioData } from '../audio/types';
import type { ColorScheme } from '../core/color-schemes';
import { hexToRgb } from '../core/color-schemes';

export class Waveform extends BaseVisualizer {
  name = 'Waveform';
  private ctx: CanvasRenderingContext2D | null = null;

  constructor(colorScheme: ColorScheme) {
    super(colorScheme);
  }

  init(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  update(audioData: AudioData): void {
    if (!this.ctx || !this.canvas) return;

    const width = this.canvas.width;
    const height = this.canvas.height;
    const timeDomainData = audioData.timeDomainData;

    // Clear canvas
    this.ctx.fillStyle = this.colorScheme.background;
    this.ctx.fillRect(0, 0, width, height);

    // Draw waveform
    const sliceWidth = width / timeDomainData.length;
    let x = 0;

    // Set up glow effect
    const rgb = hexToRgb(this.colorScheme.primary);
    this.ctx.shadowBlur = 15;
    this.ctx.shadowColor = this.colorScheme.primary;

    // Draw main waveform
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = this.colorScheme.primary;
    this.ctx.beginPath();

    for (let i = 0; i < timeDomainData.length; i++) {
      const v = timeDomainData[i] / 255.0;
      const y = v * height;

      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    this.ctx.stroke();

    // Draw secondary waveform (thicker, more transparent, for glow)
    this.ctx.shadowBlur = 30;
    this.ctx.lineWidth = 4;
    this.ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`;
    this.ctx.beginPath();

    x = 0;
    for (let i = 0; i < timeDomainData.length; i++) {
      const v = timeDomainData[i] / 255.0;
      const y = v * height;

      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    this.ctx.stroke();

    // Reset shadow
    this.ctx.shadowBlur = 0;
  }

  render(): void {
    // Rendering is done in update() for waveform to use fresh time-domain data
  }

  resize(width: number, height: number): void {
    if (this.canvas) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
  }

  dispose(): void {
    super.dispose();
    this.ctx = null;
  }
}
