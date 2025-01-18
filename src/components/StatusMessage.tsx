import { cn } from "@/lib/utils";

interface StatusMessageProps {
  type: "info" | "success" | "error";
  title: string;
  description?: string;
  className?: string;
}

export function StatusMessage({
  type,
  title,
  description,
  className,
}: StatusMessageProps) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        {
          "bg-blue-50 border-blue-200 text-blue-700": type === "info",
          "bg-green-50 border-green-200 text-green-700": type === "success",
          "bg-red-50 border-red-200 text-red-700": type === "error",
        },
        className
      )}
      role="alert"
    >
      <h3 className="text-sm font-medium">{title}</h3>
      {description && <p className="mt-1 text-sm opacity-90">{description}</p>}
    </div>
  );
}
