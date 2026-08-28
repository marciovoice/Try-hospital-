export interface ChapterMarker {
  id: string;
  startProgress: number;
  endProgress: number;
  sanskritTitle: string;
  title: string;
  tagline: string;
  description: string;
  doshas?: string[];
  keyConcept: string;
}

export interface VideoSourceOption {
  id: string;
  name: string;
  description: string;
  url: string;
  isCustom?: boolean;
}

export interface ScrollSettings {
  trackHeightVh: number; // e.g. 400vh
  maxZoomScale: number; // e.g. 1.25
  smoothingDamping: number; // e.g. 0.12
  enableParticles: boolean;
  enableVignette: boolean;
  showHUD: boolean;
}

export interface DoshaProfile {
  id: 'vata' | 'pitta' | 'kapha';
  name: string;
  sanskritName: string;
  elements: string;
  attributes: string[];
  seat: string;
  color: string;
  accentHex: string;
  summary: string;
  balancedState: string;
  imbalancedState: string;
  remedies: string[];
}
