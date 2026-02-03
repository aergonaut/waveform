import type { AudioEngine } from './audio-engine';
import type { AudioData } from './types';

export class AudioAnalyzer {
  private audioEngine: AudioEngine;
  private smoothingFactor = 0.5; // More responsive
  private amplification = 2.5; // Amplify normalized values

  // Smoothed values
  private smoothedBass = 0;
  private smoothedMid = 0;
  private smoothedTreble = 0;
  private smoothedRMS = 0;

  constructor(audioEngine: AudioEngine) {
    this.audioEngine = audioEngine;
  }

  analyze(): AudioData {
    const frequencyData = this.audioEngine.getFrequencyData();
    const timeDomainData = this.audioEngine.getTimeDomainData();

    // Calculate frequency bands with amplification
    const bass = this.getFrequencyBand(frequencyData, 20, 250) * this.amplification;
    const mid = this.getFrequencyBand(frequencyData, 250, 4000) * this.amplification;
    const treble = this.getFrequencyBand(frequencyData, 4000, 20000) * this.amplification;

    // Calculate RMS from time domain data
    const rms = this.calculateRMS(timeDomainData) * this.amplification;

    // Calculate overall energy
    const energy = this.calculateEnergy(frequencyData) * this.amplification;

    // Apply smoothing
    this.smoothedBass = this.smooth(this.smoothedBass, bass);
    this.smoothedMid = this.smooth(this.smoothedMid, mid);
    this.smoothedTreble = this.smooth(this.smoothedTreble, treble);
    this.smoothedRMS = this.smooth(this.smoothedRMS, rms);

    // Clamp values to reasonable range (allow up to 2.0 for peaks)
    return {
      frequencyData,
      timeDomainData,
      bass: Math.min(this.smoothedBass, 2.0),
      mid: Math.min(this.smoothedMid, 2.0),
      treble: Math.min(this.smoothedTreble, 2.0),
      rms: Math.min(this.smoothedRMS, 2.0),
      energy: Math.min(energy, 2.0)
    };
  }

  private getFrequencyBand(frequencyData: Uint8Array, minFreq: number, maxFreq: number): number {
    const sampleRate = this.audioEngine.getSampleRate();
    const fftSize = this.audioEngine.getFFTSize();
    const binCount = frequencyData.length;

    const freqPerBin = sampleRate / fftSize;
    const minBin = Math.floor(minFreq / freqPerBin);
    const maxBin = Math.min(Math.floor(maxFreq / freqPerBin), binCount - 1);

    let sum = 0;
    let count = 0;

    for (let i = minBin; i <= maxBin; i++) {
      sum += frequencyData[i];
      count++;
    }

    return count > 0 ? sum / count / 255 : 0; // Normalize to 0-1
  }

  private calculateRMS(timeDomainData: Uint8Array): number {
    let sum = 0;
    for (let i = 0; i < timeDomainData.length; i++) {
      const normalized = (timeDomainData[i] - 128) / 128;
      sum += normalized * normalized;
    }
    return Math.sqrt(sum / timeDomainData.length);
  }

  private calculateEnergy(frequencyData: Uint8Array): number {
    let sum = 0;
    for (let i = 0; i < frequencyData.length; i++) {
      sum += frequencyData[i];
    }
    return sum / frequencyData.length / 255; // Normalize to 0-1
  }

  private smooth(oldValue: number, newValue: number): number {
    return oldValue * this.smoothingFactor + newValue * (1 - this.smoothingFactor);
  }

  setSmoothingFactor(factor: number): void {
    this.smoothingFactor = Math.max(0, Math.min(1, factor));
  }
}
