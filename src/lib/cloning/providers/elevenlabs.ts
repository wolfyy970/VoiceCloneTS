import { VoiceCloneProvider, VoiceCloneParams, VoiceCloneResult } from "../types";

export class ElevenLabsProvider implements VoiceCloneProvider {
  private readonly apiKey: string;
  private readonly baseUrl = "https://api.elevenlabs.io/v1";
  name = "elevenlabs";

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("ElevenLabs API key is required");
    }
    this.apiKey = apiKey;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit
  ): Promise<T> {
    console.log('Making request to:', endpoint);
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "xi-api-key": this.apiKey,
        ...options.headers,
      },
    });

    const data = await response.json();
    console.log('Response:', data);

    if (!response.ok) {
      throw new Error(data.detail?.message || "An error occurred");
    }

    return data as T;
  }

  async clone(params: VoiceCloneParams): Promise<VoiceCloneResult> {
    try {
      console.log('Starting voice clone with:', { name: params.name });
      
      // Report initial progress
      params.onProgress?.({
        progress: 0,
        message: "Starting voice clone process..."
      });

      // Create form data
      const formData = new FormData();
      formData.append("name", params.name);
      formData.append("description", params.description || "Voice created from web recording");
      formData.append("files", params.file);

      // Upload and clone voice
      params.onProgress?.({
        progress: 20,
        message: "Creating voice clone..."
      });

      const response = await this.makeRequest<{ voice_id: string; name: string }>(
        "/voices/add",
        {
          method: "POST",
          body: formData,
        }
      );

      params.onProgress?.({
        progress: 100,
        message: "Voice clone completed!"
      });

      return {
        voice_id: response.voice_id,
        name: response.name,
        provider: this.name
      };
    } catch (error) {
      console.error('Error cloning voice:', error);
      throw error;
    }
  }

  async generateSettings(voiceId: string): Promise<void> {
    try {
      console.log('Generating voice settings for:', voiceId);
      await this.makeRequest(`/voices/${voiceId}/settings/generate`, {
        method: "POST",
      });
      console.log('Voice settings generated successfully');
    } catch (error) {
      console.error('Error generating voice settings:', error);
      throw error;
    }
  }
}
