export interface TimerData {
  minutes: number;
  seconds: number;
  remaining: number;
}

export interface MicrophoneCallbacks {
  onStreamReady: (recorder: MediaRecorder) => void;
  onError: (error: Error) => void;
}

export interface RecordingCallbacks {
  onTimerUpdate: (data: TimerData) => void;
  onRecordingComplete: () => void;
  onError: (error: Error) => void;
}

export interface RecordingState {
  isRecording: boolean;
  hasRecording: boolean;
}
