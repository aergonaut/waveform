export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private stream: MediaStream | null = null;

  private frequencyData: Uint8Array | null = null;
  private timeDomainData: Uint8Array | null = null;

  async init(): Promise<void> {
    try {
      // Request microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });

      // Create audio context
      this.audioContext = new AudioContext();

      // Handle Safari's suspended state
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Create gain node for amplification
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = 3.0; // Amplify signal by 3x

      // Create analyser node
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.7; // Slightly more responsive
      this.analyser.minDecibels = -100; // Capture quieter sounds
      this.analyser.maxDecibels = -20; // Adjust upper range

      // Connect microphone -> gain -> analyser
      this.microphone = this.audioContext.createMediaStreamSource(this.stream);
      this.microphone.connect(this.gainNode);
      this.gainNode.connect(this.analyser);

      // Initialize data arrays
      this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
      this.timeDomainData = new Uint8Array(this.analyser.fftSize);

      console.log('Audio engine initialized successfully');
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          throw new Error('Microphone access denied. Please allow microphone access and try again.');
        } else if (error.name === 'NotFoundError') {
          throw new Error('No microphone found. Please connect a microphone and try again.');
        }
      }
      throw error;
    }
  }

  getFrequencyData(): Uint8Array {
    if (!this.analyser || !this.frequencyData) {
      throw new Error('Audio engine not initialized');
    }
    this.analyser.getByteFrequencyData(this.frequencyData as any);
    return this.frequencyData;
  }

  getTimeDomainData(): Uint8Array {
    if (!this.analyser || !this.timeDomainData) {
      throw new Error('Audio engine not initialized');
    }
    this.analyser.getByteTimeDomainData(this.timeDomainData as any);
    return this.timeDomainData;
  }

  getSampleRate(): number {
    return this.audioContext?.sampleRate || 48000;
  }

  getFFTSize(): number {
    return this.analyser?.fftSize || 2048;
  }

  dispose(): void {
    if (this.microphone) {
      this.microphone.disconnect();
    }
    if (this.gainNode) {
      this.gainNode.disconnect();
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
    this.audioContext = null;
    this.analyser = null;
    this.microphone = null;
    this.gainNode = null;
    this.stream = null;
    this.frequencyData = null;
    this.timeDomainData = null;
  }
}
