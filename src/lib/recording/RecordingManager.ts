import { RECORDING_SETTINGS } from "../constants";
import { TimerData, RecordingCallbacks, RecordingState } from "./types";

export class RecordingManager {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private recordingStartTime: number | null = null;
  private recordingTimer: NodeJS.Timeout | null = null;
  private isRecording = false;
  private onTimerUpdate: ((data: TimerData) => void) | null = null;
  private onRecordingComplete: (() => void) | null = null;
  private onError: ((error: Error) => void) | null = null;

  setCallbacks(callbacks: RecordingCallbacks) {
    this.onTimerUpdate = callbacks.onTimerUpdate;
    this.onRecordingComplete = callbacks.onRecordingComplete;
    this.onError = callbacks.onError;
  }

  setMediaRecorder(recorder: MediaRecorder) {
    console.log("Setting up MediaRecorder...");
    this.mediaRecorder = recorder;
    this.setupMediaRecorderEvents();
  }

  private setupMediaRecorderEvents() {
    if (!this.mediaRecorder) {
      console.error("MediaRecorder not initialized");
      return;
    }

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.onstart = () => {
      console.log("Recording started");
    };

    this.mediaRecorder.onstop = () => {
      console.log("Recording stopped");
      if (this.onRecordingComplete) {
        this.onRecordingComplete();
      }
    };

    this.mediaRecorder.onerror = (event) => {
      console.error("MediaRecorder error:", event.error);
      if (this.onError) {
        this.onError(event.error);
      }
    };
  }

  startRecording() {
    if (!this.mediaRecorder || this.isRecording) {
      console.warn(
        "Cannot start recording:",
        !this.mediaRecorder ? "No MediaRecorder" : "Already recording"
      );
      return;
    }

    try {
      console.log("Starting recording...");
      this.audioChunks = [];
      this.mediaRecorder.start(100); // Collect chunks every 100ms
      this.isRecording = true;
      this.recordingStartTime = Date.now();
      this.startTimer();

      // Set timeout to stop recording at exactly 30 seconds
      setTimeout(() => {
        if (this.isRecording) {
          console.log("Recording time reached");
          this.stopRecording();
        }
      }, RECORDING_SETTINGS.RECORDING_TIME * 1000);
    } catch (error) {
      console.error("Error starting recording:", error);
      if (this.onError) {
        this.onError(error instanceof Error ? error : new Error(String(error)));
      }
    }
  }

  private startTimer() {
    if (this.recordingTimer) {
      clearInterval(this.recordingTimer);
    }

    this.recordingTimer = setInterval(() => {
      if (!this.recordingStartTime) return;

      const elapsed = Date.now() - this.recordingStartTime;
      const totalSeconds = Math.floor(elapsed / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      const remaining = Math.max(0, RECORDING_SETTINGS.RECORDING_TIME - totalSeconds);

      if (this.onTimerUpdate) {
        this.onTimerUpdate({
          minutes,
          seconds,
          remaining,
        });
      }

      // Auto-stop when recording time is reached
      if (totalSeconds >= RECORDING_SETTINGS.RECORDING_TIME) {
        this.stopRecording();
      }
    }, 1000);
  }

  stopRecording() {
    if (!this.mediaRecorder || !this.isRecording) {
      console.warn(
        "Cannot stop recording:",
        !this.mediaRecorder ? "No MediaRecorder" : "Not recording"
      );
      return;
    }

    try {
      console.log("Stopping recording...");
      this.mediaRecorder.stop();
      this.isRecording = false;
      if (this.recordingTimer) {
        clearInterval(this.recordingTimer);
        this.recordingTimer = null;
      }
    } catch (error) {
      console.error("Error stopping recording:", error);
      if (this.onError) {
        this.onError(error instanceof Error ? error : new Error(String(error)));
      }
    }
  }

  reset() {
    console.log("Resetting recording state...");
    this.isRecording = false;
    this.audioChunks = [];
    this.recordingStartTime = null;
    if (this.recordingTimer) {
      clearInterval(this.recordingTimer);
      this.recordingTimer = null;
    }
  }

  cleanup() {
    console.log("Cleaning up RecordingManager...");
    this.stopRecording();
    this.reset();
    this.mediaRecorder = null;
  }

  getRecordingState(): RecordingState {
    return {
      isRecording: this.isRecording,
      hasRecording: this.audioChunks.length > 0,
    };
  }

  getRecordingData(): Blob | null {
    if (this.audioChunks.length === 0) {
      console.warn("No recording data available");
      return null;
    }
    return new Blob(this.audioChunks, { type: "audio/webm" });
  }
}
