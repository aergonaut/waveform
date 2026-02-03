import type { Visualizer } from '../visualizers/types';
import type { AudioData } from '../audio/types';
import type { ColorScheme } from './color-schemes';

export class VisualizationManager {
  private visualizers: Map<string, Visualizer> = new Map();
  private currentVisualizer: Visualizer | null = null;
  private animationFrameId: number | null = null;
  private canvas2d: HTMLCanvasElement;
  private canvasWebGL: HTMLCanvasElement;

  constructor(canvas2d: HTMLCanvasElement, canvasWebGL: HTMLCanvasElement) {
    this.canvas2d = canvas2d;
    this.canvasWebGL = canvasWebGL;
  }

  registerVisualizer(name: string, visualizer: Visualizer): void {
    this.visualizers.set(name, visualizer);
  }

  async switchVisualizer(name: string): Promise<void> {
    const visualizer = this.visualizers.get(name);
    if (!visualizer) {
      console.error(`Visualizer ${name} not found`);
      return;
    }

    // Dispose current visualizer
    if (this.currentVisualizer) {
      this.currentVisualizer.dispose();
    }

    // Hide both canvases initially
    this.canvas2d.style.display = 'none';
    this.canvasWebGL.style.display = 'none';

    // Determine which canvas to use based on visualizer type
    const isWebGL = name === 'particle-system';
    const canvas = isWebGL ? this.canvasWebGL : this.canvas2d;
    canvas.style.display = 'block';

    // Initialize new visualizer
    visualizer.init(canvas);
    visualizer.resize(window.innerWidth, window.innerHeight);

    this.currentVisualizer = visualizer;
  }

  update(audioData: AudioData): void {
    if (this.currentVisualizer) {
      this.currentVisualizer.update(audioData);
    }
  }

  render(): void {
    if (this.currentVisualizer) {
      this.currentVisualizer.render();
    }
  }

  setColorScheme(colorScheme: ColorScheme): void {
    this.visualizers.forEach(visualizer => {
      visualizer.setColorScheme(colorScheme);
    });
  }

  handleResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.canvas2d.width = width;
    this.canvas2d.height = height;
    this.canvasWebGL.width = width;
    this.canvasWebGL.height = height;

    if (this.currentVisualizer) {
      this.currentVisualizer.resize(width, height);
    }
  }

  dispose(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }

    if (this.currentVisualizer) {
      this.currentVisualizer.dispose();
    }

    this.visualizers.clear();
  }
}
