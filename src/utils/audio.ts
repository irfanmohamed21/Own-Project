import type { ASRLanguage } from "@/types/asr";

export const MAX_AUDIO_BYTES = 100 * 1024 * 1024;

export const AUDIO_ACCEPT =
  ".wav,.mp3,.m4a,.mp4,.webm,.ogg,.opus,.aac,.flac,.mpeg,.mpga,.mov,.mkv,audio/*,video/mp4,video/webm,video/quicktime,video/x-matroska";

const SUPPORTED_EXTENSIONS = new Set([
  ".aac", ".flac", ".m4a", ".mkv", ".mov", ".mp3", ".mp4", ".mpeg",
  ".mpga", ".oga", ".ogg", ".opus", ".wav", ".webm", ".wma",
]);

export const LANGUAGE_OPTIONS: Array<{ code: ASRLanguage; label: string }> = [
  { code: "auto", label: "Auto Detect" },
  { code: "en", label: "English" },
  { code: "ta", label: "Tamil" },
  { code: "hi", label: "Hindi" },
  { code: "ml", label: "Malayalam" },
  { code: "te", label: "Telugu" },
  { code: "kn", label: "Kannada" },
  { code: "bn", label: "Bengali" },
  { code: "gu", label: "Gujarati" },
  { code: "mr", label: "Marathi" },
  { code: "pa", label: "Punjabi" },
  { code: "ur", label: "Urdu" },
  { code: "ar", label: "Arabic" },
  { code: "zh", label: "Chinese" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "es", label: "Spanish" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "pt", label: "Portuguese" },
  { code: "ru", label: "Russian" },
  { code: "it", label: "Italian" },
  { code: "nl", label: "Dutch" },
  { code: "tr", label: "Turkish" },
  { code: "vi", label: "Vietnamese" },
  { code: "id", label: "Indonesian" },
  { code: "th", label: "Thai" },
  { code: "fa", label: "Persian" },
  { code: "he", label: "Hebrew" },
  { code: "yue", label: "Cantonese" },
  { code: "af", label: "Afrikaans" },
  { code: "sq", label: "Albanian" },
  { code: "am", label: "Amharic" },
  { code: "hy", label: "Armenian" },
  { code: "as", label: "Assamese" },
  { code: "az", label: "Azerbaijani" },
  { code: "eu", label: "Basque" },
  { code: "be", label: "Belarusian" },
  { code: "bs", label: "Bosnian" },
  { code: "br", label: "Breton" },
  { code: "bg", label: "Bulgarian" },
  { code: "my", label: "Burmese" },
  { code: "ca", label: "Catalan" },
  { code: "hr", label: "Croatian" },
  { code: "cs", label: "Czech" },
  { code: "da", label: "Danish" },
  { code: "et", label: "Estonian" },
  { code: "fi", label: "Finnish" },
  { code: "gl", label: "Galician" },
  { code: "ka", label: "Georgian" },
  { code: "el", label: "Greek" },
  { code: "ht", label: "Haitian Creole" },
  { code: "ha", label: "Hausa" },
  { code: "haw", label: "Hawaiian" },
  { code: "hu", label: "Hungarian" },
  { code: "is", label: "Icelandic" },
  { code: "jw", label: "Javanese" },
  { code: "kk", label: "Kazakh" },
  { code: "km", label: "Khmer" },
  { code: "lo", label: "Lao" },
  { code: "la", label: "Latin" },
  { code: "lv", label: "Latvian" },
  { code: "ln", label: "Lingala" },
  { code: "lt", label: "Lithuanian" },
  { code: "lb", label: "Luxembourgish" },
  { code: "mk", label: "Macedonian" },
  { code: "mg", label: "Malagasy" },
  { code: "ms", label: "Malay" },
  { code: "mt", label: "Maltese" },
  { code: "mi", label: "Maori" },
  { code: "mn", label: "Mongolian" },
  { code: "ne", label: "Nepali" },
  { code: "nn", label: "Nynorsk" },
  { code: "no", label: "Norwegian" },
  { code: "oc", label: "Occitan" },
  { code: "ps", label: "Pashto" },
  { code: "pl", label: "Polish" },
  { code: "ro", label: "Romanian" },
  { code: "sa", label: "Sanskrit" },
  { code: "sr", label: "Serbian" },
  { code: "sn", label: "Shona" },
  { code: "sd", label: "Sindhi" },
  { code: "si", label: "Sinhala" },
  { code: "sk", label: "Slovak" },
  { code: "sl", label: "Slovenian" },
  { code: "so", label: "Somali" },
  { code: "su", label: "Sundanese" },
  { code: "sw", label: "Swahili" },
  { code: "sv", label: "Swedish" },
  { code: "tl", label: "Tagalog" },
  { code: "tg", label: "Tajik" },
  { code: "tt", label: "Tatar" },
  { code: "bo", label: "Tibetan" },
  { code: "tk", label: "Turkmen" },
  { code: "uk", label: "Ukrainian" },
  { code: "uz", label: "Uzbek" },
  { code: "cy", label: "Welsh" },
  { code: "yi", label: "Yiddish" },
  { code: "yo", label: "Yoruba" },
];

export function isSupportedAudioFile(file: File): boolean {
  const extension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0];
  return Boolean(extension && SUPPORTED_EXTENSIONS.has(extension));
}

export function formatFileSize(size: number): string {
  return size < 1024 * 1024
    ? `${Math.max(1, Math.round(size / 1024))} KB`
    : `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}
