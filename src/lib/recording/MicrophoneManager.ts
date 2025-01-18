import { MicrophoneCallbacks } from "./types";

export class MicrophoneManager {
  private stream: MediaStream | null = null;
  private onStreamReady: ((recorder: MediaRecorder) => void) | null = null;
  private onError: ((error: Error) => void) | null = null;

  setCallbacks(callbacks: MicrophoneCallbacks) {
    this.onStreamReady = callbacks.onStreamReady;
    this.onError = callbacks.onError;
  }

  async initialize() {
    try {
      console.log("Initializing microphone...");
      
      // Request microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });

      // Create MediaRecorder instance
      const recorder = new MediaRecorder(this.stream, {
        mimeType: "audio/webm",
      });

      if (this.onStreamReady) {
        this.onStreamReady(recorder);
      }
    } catch (error) {
      console.error("Error initializing microphone:", error);
      if (this.onError) {
        this.onError(error instanceof Error ? error : new Error(String(error)));
      }
    }
  }

  cleanup() {
    console.log("Cleaning up MicrophoneManager...");
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
  }
}
