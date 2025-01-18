import { VoiceCloneProvider, VoiceCloneParams, VoiceCloneResult } from "./types";
import { ElevenLabsProvider } from "./providers/elevenlabs";

export class VoiceCloneService {
  private providers: Map<string, VoiceCloneProvider>;

  constructor() {
    this.providers = new Map();
    
    // Initialize default providers
    if (process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY) {
      this.registerProvider(
        new ElevenLabsProvider(process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY)
      );
    }
  }

  registerProvider(provider: VoiceCloneProvider) {
    this.providers.set(provider.name, provider);
  }

  async cloneVoice(
    providerName: string,
    params: VoiceCloneParams
  ): Promise<VoiceCloneResult> {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Voice clone provider '${providerName}' not found`);
    }

    try {
      return await provider.clone(params);
    } catch (error) {
      console.error(`Error cloning voice with provider '${providerName}':`, error);
      throw error;
    }
  }

  getProvider(name: string): VoiceCloneProvider | undefined {
    return this.providers.get(name);
  }

  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}

// Create a singleton instance
const voiceCloneService = new VoiceCloneService();
export default voiceCloneService;
