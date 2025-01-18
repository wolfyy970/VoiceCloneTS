import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function saveToDesktop(blob: Blob, filename: string): Promise<string> {
  try {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    return filename;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to save file: ${error.message}`);
    }
    throw new Error('Failed to save file');
  }
}
