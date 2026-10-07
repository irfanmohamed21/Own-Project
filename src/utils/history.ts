import type { TranscriptionRecord } from "@/types/asr";

const KEY = "asr-tool-history-v1";

export function readHistory(): TranscriptionRecord[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item) => item && typeof item.transcript === "string") : [];
  } catch {
    return [];
  }
}

export function writeHistory(records: TranscriptionRecord[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(records));
  } catch {
    // Storage can be unavailable or full; current-session results remain usable.
  }
}
