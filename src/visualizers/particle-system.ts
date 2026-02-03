import * as THREE from 'three';
import { BaseVisualizer } from './base-visualizer';
import type { AudioData } from '../audio/types';
import type { ColorScheme } from '../core/color-schemes';
import { hexToRgb } from '../core/color-schemes';

export class ParticleSystem extends BaseVisualizer {
  name = 'Particle System';
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private particles: THREE.Points | null = null;
  private particleCount = 1500;
  private positions: Float32Array;
  private velocities: Float32Array;
  private colors: Float32Array;
  private originalPositions: Float32Array;
  private cameraRotation = 0;

  constructor(colorScheme: ColorScheme) {
    super(colorScheme);
    this.positions = new Float32Array(this.particleCount * 3);
    this.velocities = new Float32Array(this.particleCount * 3);
    this.colors = new Float32Array(this.particleCount * 3);
    this.originalPositions = new Float32Array(this.particleCount * 3);
    this.initializeParticles();
  }

  private initializeParticles(): void {
    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;

      // Random position in sphere
      const radius = Math.random() * 50 + 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      this.positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      this.positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      this.positions[i3 + 2] = radius * Math.cos(phi);

      // Store original positions
      this.originalPositions[i3] = this.positions[i3];
      this.originalPositions[i3 + 1] = this.positions[i3 + 1];
      this.originalPositions[i3 + 2] = this.positions[i3 + 2];

      // Initialize velocities to zero
      this.velocities[i3] = 0;
      this.velocities[i3 + 1] = 0;
      this.velocities[i3 + 2] = 0;

      // Initialize colors
      this.colors[i3] = 1;
      this.colors[i3 + 1] = 1;
      this.colors[i3 + 2] = 1;
    }
  }

  init(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;

    // Setup Three.js scene
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      75,
      canvas.width / canvas.height,
      0.1,
      1000
    );
    this.camera.position.z = 100;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(canvas.width, canvas.height);
    this.renderer.setClearColor(0x000000, 1);

    // Create particle geometry
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));

    // Create particle material
    const material = new THREE.PointsMaterial({
      size: 2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  update(audioData: AudioData): void {
    if (!this.particles) return;

    const geometry = this.particles.geometry as THREE.BufferGeometry;
    const positionAttribute = geometry.getAttribute('position') as THREE.BufferAttribute;
    const colorAttribute = geometry.getAttribute('color') as THREE.BufferAttribute;

    const primaryRgb = hexToRgb(this.colorScheme.primary);
    const secondaryRgb = hexToRgb(this.colorScheme.secondary);

    // Update particle positions and colors based on audio
    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;

      // Determine which frequency band affects this particle
      const ratio = i / this.particleCount;
      let influence = 0;

      if (ratio < 0.33) {
        // Bass affects inner particles
        influence = audioData.bass;
      } else if (ratio < 0.66) {
        // Mid affects middle particles
        influence = audioData.mid;
      } else {
        // Treble affects outer particles
        influence = audioData.treble;
      }

      // Apply velocity based on audio
      if (influence > 0.1) {
        const direction = new THREE.Vector3(
          this.originalPositions[i3],
          this.originalPositions[i3 + 1],
          this.originalPositions[i3 + 2]
        ).normalize();

        this.velocities[i3] += direction.x * influence * 0.5;
        this.velocities[i3 + 1] += direction.y * influence * 0.5;
        this.velocities[i3 + 2] += direction.z * influence * 0.5;
      }

      // Apply velocity to position
      this.positions[i3] += this.velocities[i3];
      this.positions[i3 + 1] += this.velocities[i3 + 1];
      this.positions[i3 + 2] += this.velocities[i3 + 2];

      // Apply drag
      this.velocities[i3] *= 0.95;
      this.velocities[i3 + 1] *= 0.95;
      this.velocities[i3 + 2] *= 0.95;

      // Pull back to original position
      this.positions[i3] = this.lerp(this.positions[i3], this.originalPositions[i3], 0.01);
      this.positions[i3 + 1] = this.lerp(this.positions[i3 + 1], this.originalPositions[i3 + 1], 0.01);
      this.positions[i3 + 2] = this.lerp(this.positions[i3 + 2], this.originalPositions[i3 + 2], 0.01);

      // Update colors
      const colorMix = ratio;
      this.colors[i3] = this.lerp(primaryRgb.r / 255, secondaryRgb.r / 255, colorMix);
      this.colors[i3 + 1] = this.lerp(primaryRgb.g / 255, secondaryRgb.g / 255, colorMix);
      this.colors[i3 + 2] = this.lerp(primaryRgb.b / 255, secondaryRgb.b / 255, colorMix);

      // Brighten based on influence
      const brightness = 1 + influence * 2;
      this.colors[i3] *= brightness;
      this.colors[i3 + 1] *= brightness;
      this.colors[i3 + 2] *= brightness;
    }

    positionAttribute.needsUpdate = true;
    colorAttribute.needsUpdate = true;

    // Rotate camera
    this.cameraRotation += 0.002 + audioData.energy * 0.01;
    if (this.camera) {
      this.camera.position.x = Math.sin(this.cameraRotation) * 100;
      this.camera.position.z = Math.cos(this.cameraRotation) * 100;
      this.camera.lookAt(0, 0, 0);
    }
  }

  render(): void {
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  resize(width: number, height: number): void {
    if (this.canvas) {
      this.canvas.width = width;
      this.canvas.height = height;
    }

    if (this.camera) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }

    if (this.renderer) {
      this.renderer.setSize(width, height);
    }
  }

  dispose(): void {
    if (this.particles) {
      this.particles.geometry.dispose();
      (this.particles.material as THREE.Material).dispose();
    }

    if (this.renderer) {
      this.renderer.dispose();
    }

    super.dispose();
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.particles = null;
  }
}
