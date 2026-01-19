export interface SyncStorage {
  language: string;
  speed: number;
  pitch: number;
  voices: Record<string, string>;
  readAloudEncoding: string;
  downloadEncoding: string;
  subscriptionKey: string;
  region: string;
  audioProfile: string;
  volumeGainDb: number;
  credentialsValid: boolean;
  apiKeyValid?: boolean;
  engine: string;
}

export interface SessionStorage {
  voices?: Voice[];
  languages?: string[];
}

export interface Voice {
  name: string;
  shortName: string;
  locale: string;
  localName: string;
  gender: string;
  voiceType: string;
  styleList?: string[];
}

export interface LanguageOption {
  value: string;
  title: string;
  description?: string;
}

export interface VoiceOption {
  value: string;
  title: string;
  description: string;
}

export interface EngineOption {
  value: string;
  title: string;
  description: string;
}

export interface SynthesizeParams {
  text: string;
  encoding: string;
  voice: string;
  subscriptionKey: string;
  region: string;
  speed: number;
  pitch: number;
  volumeGainDb: number;
  engine: string;
}
