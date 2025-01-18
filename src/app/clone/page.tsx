"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Upload, Check, X, Loader2 } from "lucide-react";
import voiceCloneService from "@/lib/cloning/service";
import type { VoiceCloneProgress } from "@/lib/cloning/types";

type CloneState = 
  | "initial"        // Initial state, no file selected
  | "loading_file"   // File is being loaded into browser
  | "file_loaded"    // File is loaded and ready
  | "uploading"      // Uploading to provider
  | "encoding"       // Provider is encoding
  | "success"        // Process completed successfully
  | "error";         // Error state

interface StateMessage {
  title: string;
  description?: string;
  isError?: boolean;
}

export default function ClonePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cloneState, setCloneState] = useState<CloneState>("initial");
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [voiceName, setVoiceName] = useState("");
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");

  const getStateMessage = (state: CloneState): StateMessage => {
    switch (state) {
      case "initial":
        return {
          title: "Select Voice Recording",
          description: "Upload the .webm file saved from your recording"
        };
      case "loading_file":
        return {
          title: "Loading File...",
          description: "Please wait while we load your recording"
        };
      case "file_loaded":
        return {
          title: "File Ready",
          description: "Enter a name for your voice clone and click 'Start Cloning'"
        };
      case "uploading":
      case "encoding":
        return {
          title: progressMessage || "Processing...",
          description: `Progress: ${progress}%`
        };
      case "success":
        return {
          title: "Voice Clone Created!",
          description: "Redirecting to playback page..."
        };
      case "error":
        return {
          title: error || "An error occurred",
          isError: true
        };
      default:
        return {
          title: "Unknown State",
          isError: true
        };
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setCloneState("loading_file");
      setError(null);

      // Debug file information
      console.log('File type:', file.type);
      console.log('File name:', file.name);
      console.log('File size:', file.size);

      // Accept both audio/webm and video/webm (some browsers record as video/webm)
      if (!file.type.includes('webm')) {
        throw new Error("Please select a .webm file");
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("File size must be less than 10MB");
      }

      setSelectedFile(file);
      setCloneState("file_loaded");
      console.log('File processed successfully');
    } catch (err) {
      console.error('File processing error:', err);
      setError(err instanceof Error ? err.message : "Failed to load file");
      setCloneState("error");
      setSelectedFile(null);
    }
  };

  const handleCloneVoice = async () => {
    if (!selectedFile || !voiceName.trim()) return;

    try {
      setCloneState("uploading");
      setProgress(0);
      setProgressMessage("Starting voice clone process...");

      // Get the first available provider (ElevenLabs in this case)
      const providers = voiceCloneService.getAvailableProviders();
      if (providers.length === 0) {
        throw new Error("No voice clone providers available");
      }

      const voiceResponse = await voiceCloneService.cloneVoice(
        providers[0],
        {
          name: voiceName.trim(),
          file: selectedFile,
          description: "Voice created from web recording",
          onProgress: (progress: VoiceCloneProgress) => {
            setProgress(progress.progress);
            setProgressMessage(progress.message);
            if (progress.progress > 20) {
              setCloneState("encoding");
            }
          }
        }
      );

      // Store voice information
      localStorage.setItem("voiceId", voiceResponse.voice_id);
      localStorage.setItem("voiceName", voiceResponse.name);
      localStorage.setItem("voiceProvider", voiceResponse.provider);

      setCloneState("success");
      
      // Delay redirect to show success state
      setTimeout(() => {
        router.push("/playback");
      }, 1500);
    } catch (err) {
      console.error('Error cloning voice:', err);
      setError(err instanceof Error ? err.message : "Failed to clone voice");
      setCloneState("error");
    }
  };

  const stateMessage = getStateMessage(cloneState);

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-10">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Clone Voice</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Create an AI voice clone from your recording. The process takes about 3-5 minutes.
            </p>
          </div>

          <div className="flex flex-col items-center space-y-6">
            {/* Name Input */}
            <div className="w-full max-w-md">
              <label htmlFor="voiceName" className="block text-sm font-medium mb-2">
                Voice Clone Name
              </label>
              <input
                id="voiceName"
                type="text"
                value={voiceName}
                onChange={(e) => setVoiceName(e.target.value)}
                placeholder="Enter a name for your voice clone"
                className="w-full px-4 py-2 border rounded-lg bg-background"
                disabled={cloneState === "uploading" || cloneState === "encoding"}
              />
            </div>

            {/* File Upload */}
            <div className="w-full max-w-md">
              <input
                type="file"
                accept=".webm,audio/webm,video/webm"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileSelect}
              />
              <Button
                variant="outline"
                className={`w-full h-32 border-dashed relative ${
                  selectedFile ? 'border-primary' : ''
                }`}
                onClick={() => fileInputRef.current?.click()}
                disabled={cloneState === "uploading" || cloneState === "encoding"}
              >
                <div className="flex flex-col items-center space-y-2">
                  {selectedFile ? (
                    <>
                      <Check className="h-8 w-8 text-primary" />
                      <span className="text-sm text-primary font-medium">
                        {selectedFile.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Click to change file
                      </span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8" />
                      <span className="text-sm">Click to upload voice recording</span>
                      <span className="text-xs text-muted-foreground">
                        Select the .webm file saved earlier
                      </span>
                    </>
                  )}
                </div>
              </Button>
            </div>

            {/* Status Message */}
            <div className={`w-full max-w-md p-4 rounded-lg ${
              stateMessage.isError ? 'bg-destructive/15' : 'bg-muted'
            }`}>
              <div className="flex items-center space-x-2">
                {cloneState === "loading_file" || cloneState === "uploading" || cloneState === "encoding" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : stateMessage.isError ? (
                  <X className="h-4 w-4 text-destructive" />
                ) : (
                  <Check className="h-4 w-4 text-primary" />
                )}
                <div>
                  <h3 className={`font-medium ${
                    stateMessage.isError ? 'text-destructive' : ''
                  }`}>
                    {stateMessage.title}
                  </h3>
                  {stateMessage.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {stateMessage.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Progress Bar for Processing */}
              {(cloneState === "uploading" || cloneState === "encoding") && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 bg-muted-foreground/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-500 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Clone Button */}
            <Button
              onClick={handleCloneVoice}
              disabled={
                !selectedFile || 
                !voiceName.trim() || 
                cloneState === "uploading" || 
                cloneState === "encoding" ||
                cloneState === "success"
              }
              className="w-full max-w-md"
            >
              {cloneState === "uploading" || cloneState === "encoding" ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </span>
              ) : (
                "Start Cloning"
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
