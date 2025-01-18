"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { RecordButton } from "@/components/RecordButton";
import { StatusMessage } from "@/components/StatusMessage";
import { MicrophoneManager } from "@/lib/recording/MicrophoneManager";
import { RecordingManager } from "@/lib/recording/RecordingManager";
import { ScrollManager } from "@/lib/recording/ScrollManager";
import { RECORDING_SETTINGS, SAMPLE_TEXT } from "@/lib/constants";
import { saveToDesktop } from "@/lib/utils";
import { Mic } from "lucide-react";

enum RecordingState {
  INITIAL = "initial",
  READY = "ready",
  RECORDING = "recording",
  COMPLETED = "completed",
  SAVING = "saving",
  SAVED = "saved",
}

export default function HomePage() {
  const [currentState, setCurrentState] = useState<RecordingState>(RecordingState.INITIAL);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState("00:00");
  const [status, setStatus] = useState<{
    type: "info" | "success" | "error";
    title: string;
    description?: string;
  }>({
    type: "info",
    title: "Welcome to Voice Clone",
    description: "Click Start Recording when you're ready to begin.",
  });

  const sampleTextRef = useRef<HTMLDivElement>(null);
  const micManagerRef = useRef<MicrophoneManager | null>(null);
  const recordingManagerRef = useRef<RecordingManager | null>(null);
  const scrollManagerRef = useRef<ScrollManager | null>(null);

  const resetState = useCallback(() => {
    setCurrentState(RecordingState.INITIAL);
    setIsInitialized(false);
    setIsRecording(false);
    setRecordingTime("00:00");
    setStatus({
      type: "info",
      title: "Welcome to Voice Clone",
      description: "Click Start Recording when you're ready to begin.",
    });

    // Reset managers
    micManagerRef.current?.cleanup();
    recordingManagerRef.current?.cleanup();
    scrollManagerRef.current?.cleanup();

    // Reinitialize microphone
    initializeMicrophone();
  }, []);

  const updateState = useCallback((newState: RecordingState) => {
    setCurrentState(newState);
    
    switch (newState) {
      case RecordingState.INITIAL:
        setIsInitialized(false);
        setStatus({
          type: "info",
          title: "Requesting microphone access...",
          description: "Please allow microphone access when prompted.",
        });
        break;

      case RecordingState.READY:
        setIsInitialized(true);
        setStatus({
          type: "info",
          title: "Ready to record",
          description: "Click Start Recording and read the text above.",
        });
        break;

      case RecordingState.RECORDING:
        setIsRecording(true);
        setStatus({
          type: "info",
          title: "Recording in progress...",
          description: "Read the text naturally at a comfortable pace.",
        });
        break;

      case RecordingState.COMPLETED:
        setIsRecording(false);
        setStatus({
          type: "success",
          title: "Recording complete!",
          description: "Click Save Recording to download your voice sample.",
        });
        break;

      case RecordingState.SAVING:
        setStatus({
          type: "info",
          title: "Saving recording...",
          description: "Please wait while your recording is being saved.",
        });
        break;

      case RecordingState.SAVED:
        setIsRecording(false);
        setRecordingTime("00:00");
        setStatus({
          type: "success",
          title: "Recording saved successfully!",
          description: "Click New Recording to start again.",
        });
        break;
    }
  }, []);

  const initializeMicrophone = useCallback(async () => {
    try {
      micManagerRef.current = new MicrophoneManager();
      recordingManagerRef.current = new RecordingManager();

      if (sampleTextRef.current) {
        scrollManagerRef.current = new ScrollManager(sampleTextRef.current);
      }

      micManagerRef.current.setCallbacks({
        onStreamReady: (recorder) => {
          if (recordingManagerRef.current) {
            recordingManagerRef.current.setMediaRecorder(recorder);
            updateState(RecordingState.READY);
          }
        },
        onError: (error) => {
          setStatus({
            type: "error",
            title: "Microphone Error",
            description: error.message,
          });
        },
      });

      if (recordingManagerRef.current) {
        recordingManagerRef.current.setCallbacks({
          onTimerUpdate: ({ minutes, seconds, remaining }) => {
            setRecordingTime(
              `${minutes.toString().padStart(2, "0")}:${seconds
                .toString()
                .padStart(2, "0")}`
            );

            if (remaining > 0) {
              setStatus({
                type: "info",
                title: "Recording in progress...",
                description: "Continue reading at a natural pace.",
              });
            }
          },
          onRecordingComplete: () => {
            scrollManagerRef.current?.stopAutoScroll();
            updateState(RecordingState.COMPLETED);
          },
          onError: (error) => {
            scrollManagerRef.current?.stopAutoScroll();
            setStatus({
              type: "error",
              title: "Recording Error",
              description: error.message,
            });
            updateState(RecordingState.READY);
          },
        });
      }

      updateState(RecordingState.INITIAL);
      await micManagerRef.current.initialize();
    } catch (error) {
      setStatus({
        type: "error",
        title: "Microphone Error",
        description: error instanceof Error ? error.message : "Failed to initialize microphone",
      });
    }
  }, [updateState]);

  const handleRecordClick = useCallback(() => {
    if (!recordingManagerRef.current) return;

    const state = recordingManagerRef.current.getRecordingState();

    if (!state.isRecording) {
      updateState(RecordingState.RECORDING);
      recordingManagerRef.current.startRecording();

      setTimeout(() => {
        if (scrollManagerRef.current && recordingManagerRef.current) {
          scrollManagerRef.current.startAutoScroll(() => {
            const currentState = recordingManagerRef.current?.getRecordingState();
            return currentState?.isRecording ?? false;
          });
        }
      }, RECORDING_SETTINGS.SCROLL_START_DELAY);
    } else {
      recordingManagerRef.current.stopRecording();
      scrollManagerRef.current?.stopAutoScroll();
    }
  }, [updateState]);

  const handleSaveClick = useCallback(async () => {
    try {
      updateState(RecordingState.SAVING);

      const audioBlob = recordingManagerRef.current?.getRecordingData();
      if (!audioBlob) {
        throw new Error("No recording data available");
      }

      const filename = `voice-sample-${new Date()
        .toISOString()
        .slice(0, 10)}.webm`;
      const savedName = await saveToDesktop(audioBlob, filename);

      setStatus({
        type: "success",
        title: `Recording saved as ${savedName}!`,
        description: "Click New Recording to start again.",
      });

      recordingManagerRef.current?.reset();
      updateState(RecordingState.SAVED);
    } catch (error) {
      setStatus({
        type: "error",
        title: "Error saving recording",
        description: error instanceof Error ? error.message : "Unknown error",
      });
      updateState(RecordingState.COMPLETED);
    }
  }, [updateState]);

  useEffect(() => {
    initializeMicrophone();
    return () => {
      micManagerRef.current?.cleanup();
      recordingManagerRef.current?.cleanup();
      scrollManagerRef.current?.cleanup();
    };
  }, [initializeMicrophone]);

  const showSampleText = currentState !== RecordingState.SAVED;
  const showRecordButton = currentState !== RecordingState.SAVED;
  const showSaveButton = currentState === RecordingState.COMPLETED;
  const showNewRecordingButton = currentState === RecordingState.SAVED;

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-10">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Record Voice Sample</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Please read the following text clearly and naturally. This sample will be used to create your digital voice clone.
            </p>
          </div>

          {showSampleText && (
            <div className="bg-card rounded-lg p-8 shadow-sm border border-border">
              <h2 className="text-xl font-semibold mb-6">
                Sample Text:
              </h2>
              <div
                ref={sampleTextRef}
                className="prose dark:prose-invert max-h-[300px] overflow-y-auto rounded-md bg-muted/50 p-6 hide-scrollbar"
              >
                {SAMPLE_TEXT.split("\n\n").map((paragraph, index) => (
                  <p key={index} className="mb-4 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-8">
            <div className="flex flex-col items-center gap-8">
              {showRecordButton && (
                <RecordButton
                  isRecording={isRecording}
                  isDisabled={!isInitialized}
                  onClick={handleRecordClick}
                  timeLeft={recordingTime}
                />
              )}

              {showSaveButton && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleSaveClick}
                  className="min-w-[200px]"
                >
                  Save Recording
                </Button>
              )}

              {showNewRecordingButton && (
                <Button
                  variant="default"
                  size="lg"
                  onClick={resetState}
                  className="min-w-[200px]"
                >
                  <Mic className="mr-2 h-4 w-4" />
                  New Recording
                </Button>
              )}
            </div>

            <StatusMessage
              type={status.type}
              title={status.title}
              description={status.description}
              className="max-w-2xl mx-auto"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
