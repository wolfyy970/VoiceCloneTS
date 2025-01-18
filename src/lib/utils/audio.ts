export async function base64ToBlob(base64: string): Promise<Blob> {
  // Remove data URL prefix if present
  const base64Data = base64.replace(/^data:audio\/\w+;base64,/, "");
  
  // Decode base64
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return new Blob([bytes], { type: "audio/webm" });
}

export function generateVoiceName(): string {
  const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const random = Math.random().toString(36).substring(2, 8);
  return `voice_${timestamp}_${random}`;
}
