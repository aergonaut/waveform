import './style.css';
import { AudioEngine } from './audio/audio-engine';
import { AudioAnalyzer } from './audio/audio-analyzer';
import { VisualizationManager } from './core/viz-manager';
import { FrequencyBars } from './visualizers/frequency-bars';
import { ParticleSystem } from './visualizers/particle-system';
import { Waveform } from './visualizers/waveform';
import { PermissionPrompt } from './ui/permission-prompt';
import { Controls } from './ui/controls';
import { colorSchemes, colorSchemeKeys, type ColorSchemeName } from './core/color-schemes';

class App {
  private audioEngine: AudioEngine;
  private audioAnalyzer: AudioAnalyzer;
  private vizManager: VisualizationManager;
  private controls: Controls;
  private currentColorScheme: ColorSchemeName = 'classic';
  private animationFrameId: number | null = null;

  private visualizerNames = ['frequency-bars', 'particle-system', 'waveform'];

  constructor() {
    // Get canvas elements
    const canvas2d = document.getElementById('canvas2d') as HTMLCanvasElement;
    const canvasWebGL = document.getElementById('webgl') as HTMLCanvasElement;

    // Initialize audio components
    this.audioEngine = new AudioEngine();
    this.audioAnalyzer = new AudioAnalyzer(this.audioEngine);

    // Initialize visualization manager
    this.vizManager = new VisualizationManager(canvas2d, canvasWebGL);

    // Register visualizers
    this.vizManager.registerVisualizer(
      'frequency-bars',
      new FrequencyBars(colorSchemes[this.currentColorScheme])
    );
    this.vizManager.registerVisualizer(
      'particle-system',
      new ParticleSystem(colorSchemes[this.currentColorScheme])
    );
    this.vizManager.registerVisualizer(
      'waveform',
      new Waveform(colorSchemes[this.currentColorScheme])
    );

    // Initialize UI
    new PermissionPrompt(() => this.start());
    this.controls = new Controls(
      (index) => this.switchVisualizer(index),
      (index) => this.switchColorScheme(index)
    );

    // Setup resize handler
    window.addEventListener('resize', () => this.handleResize());

    // Initial resize
    this.handleResize();
  }

  private async start(): Promise<void> {
    try {
      // Initialize audio engine
      await this.audioEngine.init();

      // Start with first visualizer
      await this.vizManager.switchVisualizer(this.visualizerNames[0]);

      // Show controls
      this.controls.show();

      // Start render loop
      this.startRenderLoop();

      console.log('Visualization started successfully');
    } catch (error) {
      console.error('Failed to start visualization:', error);
      throw error;
    }
  }

  private startRenderLoop(): void {
    const render = () => {
      // Analyze audio
      const audioData = this.audioAnalyzer.analyze();

      // Update and render visualization
      this.vizManager.update(audioData);
      this.vizManager.render();

      // Continue loop
      this.animationFrameId = requestAnimationFrame(render);
    };

    render();
  }

  private async switchVisualizer(index: number): Promise<void> {
    if (index >= 0 && index < this.visualizerNames.length) {
      const name = this.visualizerNames[index];
      await this.vizManager.switchVisualizer(name);
      console.log(`Switched to ${name}`);
    }
  }

  private switchColorScheme(index: number): void {
    if (index >= 0 && index < colorSchemeKeys.length) {
      this.currentColorScheme = colorSchemeKeys[index];
      const scheme = colorSchemes[this.currentColorScheme];
      this.vizManager.setColorScheme(scheme);
      console.log(`Switched to ${scheme.name} color scheme`);
    }
  }

  private handleResize(): void {
    this.vizManager.handleResize();
  }

  dispose(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.audioEngine.dispose();
    this.vizManager.dispose();
  }
}

// Initialize app
const app = new App();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  app.dispose();
});
