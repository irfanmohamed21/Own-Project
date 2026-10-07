export type ASRModel = "tiny" | "base" | "small" | "medium";

export type ASRLanguage =
  | "auto"
  | "af" | "sq" | "am" | "ar" | "hy" | "as" | "az" | "ba" | "eu" | "be"
  | "bn" | "bs" | "br" | "bg" | "my" | "ca" | "zh" | "hr" | "cs" | "da"
  | "nl" | "en" | "et" | "fo" | "fi" | "fr" | "gl" | "ka" | "de" | "el"
  | "gu" | "ht" | "ha" | "haw" | "he" | "hi" | "hu" | "is" | "id" | "it"
  | "ja" | "jw" | "ko" | "kn" | "kk" | "km" | "lo" | "la" | "lv" | "ln" | "lt"
  | "lb" | "mk" | "mg" | "ms" | "ml" | "mt" | "mi" | "mr" | "mn" | "ne"
  | "nn" | "no" | "oc" | "ps" | "fa" | "pl" | "pt" | "pa" | "ro" | "ru"
  | "sa" | "sr" | "sn" | "sd" | "si" | "sk" | "sl" | "so" | "es" | "su"
  | "sw" | "sv" | "tl" | "tg" | "ta" | "tt" | "te" | "th" | "bo" | "tr"
  | "tk" | "uk" | "ur" | "uz" | "vi" | "cy" | "yi" | "yo" | "yue";

export interface ASRApiResponse {
  text: string;
  language: string;
  duration: number;
  processing_time: number;
  model: ASRModel;
}

export type TranscriptionRecord = {
  id: string;
  filename: string;
  transcript: string;
  detectedLanguage: string;
  elapsedSeconds: number;
  processingTime?: number;
  model: ASRModel;
  duration?: number;
  createdAt: string;
};

export type TranscribeResult = {
  transcript: string;
  detectedLanguage: string;
  processingTime: number;
  duration: number;
  model: ASRModel;
};
