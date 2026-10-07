import type {
  ASRApiResponse,
  ASRLanguage,
  ASRModel,
  TranscribeResult,
} from "@/types/asr";
import { LANGUAGE_OPTIONS } from "@/utils/audio";

const REQUEST_TIMEOUT_MS = 5 * 60 * 1000;
const MODEL_NAMES: ASRModel[] = ["tiny", "base", "small", "medium"];

export class TranscriptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TranscriptionError";
  }
}

function isApiResponse(value: unknown, requestedModel: ASRModel): value is ASRApiResponse {
  if (!value || typeof value !== "object") return false;
  const data = value as Record<string, unknown>;
  return (
    typeof data.text === "string" &&
    typeof data.language === "string" &&
    data.language.trim().length > 0 &&
    typeof data.duration === "number" &&
    Number.isFinite(data.duration) &&
    data.duration >= 0 &&
    typeof data.processing_time === "number" &&
    Number.isFinite(data.processing_time) &&
    data.processing_time >= 0 &&
    typeof data.model === "string" &&
    MODEL_NAMES.includes(data.model as ASRModel) &&
    data.model === requestedModel
  );
}

export async function transcribeAudio(
  file: File,
  model: ASRModel,
  language: ASRLanguage,
): Promise<TranscribeResult> {
  const base = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, "");
  if (!base) {
    throw new TranscriptionError(
      "Transcription service is not configured. Add VITE_API_URL to the environment and restart the app.",
    );
  }

  const form = new FormData();
  form.append("file", file);
  form.append("model", model);
  form.append("language", language);

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    let response: Response;
    try {
      response = await fetch(`${base}/api/transcribe`, {
        method: "POST",
        body: form,
        signal: controller.signal,
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new TranscriptionError(
          "This recording took too long to process. Try a shorter file or a smaller model.",
        );
      }
      throw new TranscriptionError(
        "Could not reach the transcription service. Check that the backend is running and allows this app to connect.",
      );
    }

    if (!response.ok) {
      if (response.status === 413) {
        throw new TranscriptionError("The service rejected this file because it is too large.");
      }
      if (response.status === 415) {
        throw new TranscriptionError("The transcription service does not support this file type.");
      }
      if (response.status === 503 || response.status >= 500) {
        throw new TranscriptionError(
          "The transcription service is temporarily unavailable. Check the backend model setup and try again.",
        );
      }
      throw new TranscriptionError(
        "The service could not process this audio. Check the file and your language selection, then try again.",
      );
    }

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      if (controller.signal.aborted) {
        throw new TranscriptionError(
          "This recording took too long to process. Try a shorter file or a smaller model.",
        );
      }
      throw new TranscriptionError(
        "The service returned an unreadable response. No transcript was saved.",
      );
    }

    if (!isApiResponse(data, model)) {
      throw new TranscriptionError(
        "The service response did not match the expected transcription format. No result was saved.",
      );
    }

    const languageLabel =
      LANGUAGE_OPTIONS.find((option) => option.code === data.language)?.label ?? data.language;

    return {
      transcript: data.text,
      detectedLanguage: languageLabel,
      processingTime: data.processing_time,
      duration: data.duration,
      model: data.model,
    };
  } finally {
    window.clearTimeout(timer);
  }
}
