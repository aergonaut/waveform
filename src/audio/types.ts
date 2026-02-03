export interface AudioData {
  frequencyData: Uint8Array;
  timeDomainData: Uint8Array;
  bass: number;
  mid: number;
  treble: number;
  rms: number;
  energy: number;
}

export interface AudioFeatures {
  rms: number;
  energy: number;
  spectralCentroid?: number;
  zcr?: number;
}
