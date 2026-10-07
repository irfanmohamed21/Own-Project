import { useEffect, useState } from "react";
import { AudioLines, Check, RotateCcw, Sparkles } from "lucide-react";
import { AudioRecorder } from "@/components/AudioRecorder";
import { AudioUploader } from "@/components/AudioUploader";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ModelSelector } from "@/components/ModelSelector";
import { PageMeta } from "@/components/PageMeta";
import { TranscriptionResult } from "@/components/TranscriptionResult";
import { TranscriptionError, transcribeAudio } from "@/services/api";
import type {
  ASRLanguage,
  ASRModel,
  TranscriptionRecord,
} from "@/types/asr";
import { MAX_AUDIO_BYTES, formatFileSize, isSupportedAudioFile } from "@/utils/audio";
import { readHistory, writeHistory } from "@/utils/history";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState<number>();
  const [model, setModel] = useState<ASRModel>("base");
  const [language, setLanguage] = useState<ASRLanguage>("auto");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<TranscriptionRecord | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    try {
      const pending = localStorage.getItem("asr-tool-open-record");
      if (pending) {
        try {
          const record = JSON.parse(pending) as TranscriptionRecord;
          if (record && typeof record.transcript === "string") {
            setResult(record);
            setFile(null);
          }
        } catch {
          // Ignore malformed local state.
        }
        localStorage.removeItem("asr-tool-open-record");
      }
    } catch {
      // Browser storage may be disabled; the workspace remains available.
    }
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function validateAndSet(nextFile: File, recordedDuration?: number) {
    setError("");
    if (!isSupportedAudioFile(nextFile)) {
      setError("That file type is not supported. Choose a common audio or video file such as WAV, MP3, M4A, or MP4.");
      return;
    }
    if (nextFile.size > MAX_AUDIO_BYTES) {
      setError(`This file is ${formatFileSize(nextFile.size)}. The maximum file size is 100 MB.`);
      return;
    }
    if (!nextFile.size) {
      setError("This file is empty. Choose a recording that contains audio.");
      return;
    }
    setFile(nextFile);
    setDuration(recordedDuration);
    setResult(null);
  }

  function removeFile() {
    setFile(null);
    setDuration(undefined);
    setError("");
  }

  function clearAll() {
    removeFile();
    setResult(null);
    setError("");
  }

  async function runTranscription() {
    if (!file) {
      setError("Choose an audio file or record audio before transcribing.");
      return;
    }

    setBusy(true);
    setError("");
    setResult(null);
    const started = performance.now();
    try {
      const response = await transcribeAudio(file, model, language);
      const record: TranscriptionRecord = {
        id: typeof crypto.randomUUID === "function" ? crypto.randomUUID() : String(Date.now()),
        filename: file.name,
        transcript: response.transcript,
        detectedLanguage: response.detectedLanguage,
        elapsedSeconds: (performance.now() - started) / 1000,
        processingTime: response.processingTime,
        model: response.model,
        duration: response.duration ?? duration,
        createdAt: new Date().toISOString(),
      };
      setResult(record);
      const previous = readHistory();
      writeHistory([record, ...previous.filter((item) => item.id !== record.id)].slice(0, 50));
    } catch (transcriptionError) {
      setError(
        transcriptionError instanceof TranscriptionError
          ? transcriptionError.message
          : "Something went wrong while transcribing. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function copyTranscript() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.transcript);
      setToast("Transcript copied to clipboard");
    } catch {
      setError("Clipboard access is unavailable. Select and copy the transcript manually.");
    }
  }

  function downloadTranscript() {
    if (!result) return;
    const blob = new Blob([result.transcript], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${result.filename.replace(/\.[^.]+$/, "") || "transcript"}.txt`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <>
      <PageMeta
        title="Transcribe"
        description="Convert audio recordings into text with a configurable automatic speech recognition service."
      />
      <div className="page-wrap">
        <div className="page-heading">
          <div>
            <div className="eyebrow">Speech to text / Workspace</div>
            <h1>
              Give your words
              <br />
              a written form.
            </h1>
            <p className="page-lede">
              Add a recording, choose how it should be recognized, and get a transcript back from
              your configured speech service.
            </p>
          </div>
          {result && (
            <button
              className="btn btn-secondary"
              type="button"
              onClick={clearAll}
              data-testid="button-new-transcription"
            >
              <RotateCcw size={15} />
              New transcription
            </button>
          )}
        </div>

        <div className="workspace-grid">
          <section className="panel panel-pad" aria-label="Audio input and transcription settings">
            <div className="panel-title">Your recording</div>
            <p className="panel-copy">Upload an audio file or record directly from your microphone.</p>
            <AudioUploader
              file={file}
              duration={duration}
              disabled={busy}
              onSelect={(selectedFile) => validateAndSet(selectedFile)}
              onRemove={removeFile}
              onDuration={setDuration}
            />

            <div className="controls">
              <ModelSelector value={model} onChange={setModel} />
              <LanguageSelector value={language} onChange={setLanguage} />
            </div>
            <div className="submit-row">
              <span className="limit-note">Your file is sent to your configured backend.</span>
              <button
                className="btn btn-primary"
                type="button"
                onClick={runTranscription}
                disabled={busy}
                data-testid="button-transcribe"
              >
                {busy ? (
                  <>
                    <Sparkles size={15} />
                    Transcribing…
                  </>
                ) : (
                  <>
                    <AudioLines size={16} />
                    Transcribe Audio
                  </>
                )}
              </button>
            </div>
            <AudioRecorder
              disabled={busy}
              onRecorded={(recordedFile, recordedDuration) =>
                validateAndSet(recordedFile, recordedDuration)
              }
              onError={setError}
            />
            {error && (
              <div role="alert" className="error-box" data-testid="status-error">
                {error}
              </div>
            )}
          </section>

          <TranscriptionResult
            result={result}
            isTranscribing={busy}
            onCopy={copyTranscript}
            onDownload={downloadTranscript}
            onClear={clearAll}
          />
        </div>
      </div>
      {toast && (
        <div className="toast-inline" role="status" data-testid="status-toast">
          <Check size={14} style={{ display: "inline", marginRight: 7 }} />
          {toast}
        </div>
      )}
    </>
  );
}
