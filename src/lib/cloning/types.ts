export interface VoiceCloneResult {
  voice_id: string;
  name: string;
  provider: string;
}

export interface VoiceCloneProgress {
  progress: number;
  message: string;
}

export interface VoiceCloneProvider {
  name: string;
  clone(params: VoiceCloneParams): Promise<VoiceCloneResult>;
  generateSettings?(voiceId: string): Promise<void>;
}

export interface VoiceCloneParams {
  name: string;
  file: Blob;
  description?: string;
  onProgress?: (progress: VoiceCloneProgress) => void;
}
