import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RecordButtonProps {
  isRecording: boolean;
  isDisabled: boolean;
  onClick: () => void;
  timeLeft: string;
}

export function RecordButton({
  isRecording,
  isDisabled,
  onClick,
  timeLeft,
}: RecordButtonProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <Button
        onClick={onClick}
        disabled={isDisabled}
        variant={isRecording ? "destructive" : "default"}
        size="lg"
        className={cn(
          "min-w-[240px] px-12 py-6 h-auto text-lg font-medium",
          isRecording && "animate-pulse"
        )}
      >
        <div className="flex items-center gap-3">
          <Mic className="h-5 w-5" />
          <span>{isRecording ? timeLeft : "Start"}</span>
        </div>
      </Button>
      <div className="text-sm text-muted-foreground">
        {isDisabled
          ? "Initializing microphone..."
          : isRecording
          ? "Recording in progress..."
          : "Click to start recording"}
      </div>
    </div>
  );
}
