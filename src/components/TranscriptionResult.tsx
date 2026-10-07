import { AudioLines, Check, Clipboard, Download, LoaderCircle, Trash2 } from "lucide-react";
import type { TranscriptionRecord } from "@/types/asr";
import { formatDuration } from "@/utils/audio";

type TranscriptionResultProps = {
  result: TranscriptionRecord | null;
  isTranscribing: boolean;
  onCopy: () => void;
  onDownload: () => void;
  onClear: () => void;
};

export function TranscriptionResult({
  result,
  isTranscribing,
  onCopy,
  onDownload,
  onClear,
}: TranscriptionResultProps) {
  return (
    <section className="panel result-panel" aria-label="Transcription result">
      <div className="result-header">
        <div>
          <div className="panel-title">Transcript</div>
          <div className="panel-copy" style={{ margin: "4px 0 0" }}>
            {isTranscribing
              ? "Transcribing your audio..."
              : result
                ? result.filename
                : "Your result will appear here"}
          </div>
        </div>
        {result && (
          <div className="result-actions">
            <button
              className="btn btn-quiet"
              type="button"
              aria-label="Copy transcript"
              title="Copy transcript"
              onClick={onCopy}
              data-testid="button-copy-transcript"
            >
              <Clipboard size={16} />
              <span className="sr-only">Copy text</span>
            </button>
            <button
              className="btn btn-quiet"
              type="button"
              aria-label="Download transcript as text"
              title="Download TXT"
              onClick={onDownload}
              data-testid="button-download-transcript"
            >
              <Download size={16} />
              <span className="sr-only">Download TXT</span>
            </button>
            <button
              className="btn btn-quiet btn-danger"
              type="button"
              aria-label="Clear transcript"
              title="Clear transcript"
              onClick={onClear}
              data-testid="button-clear-result"
            >
              <Trash2 size={16} />
              <span className="sr-only">Clear</span>
            </button>
          </div>
        )}
      </div>

      {isTranscribing ? (
        <div className="loading-state" role="status" data-testid="status-transcribing">
          <LoaderCircle className="transcribing-spinner" size={32} aria-hidden="true" />
          <strong>Transcribing your audio...</strong>
          <span className="panel-copy">The ASR service is processing your recording.</span>
        </div>
      ) : result ? (
        <>
          <div className="result-content">
            <div className="result-text" data-testid="text-transcript">
              {result.transcript || (
                <span className="no-speech">No speech was recognized in this recording.</span>
              )}
            </div>
          </div>
          <div className="result-meta" data-testid="transcript-metadata">
            <span className="meta-chip">Language · {result.detectedLanguage}</span>
            <span className="meta-chip">Model · {result.model}</span>
            <span className="meta-chip">Processing · {result.processingTime === undefined ? "Not reported" : `${result.processingTime.toFixed(1)} s`}</span>
            <span className="meta-chip">Audio · {result.duration === undefined ? "Not reported" : formatDuration(result.duration)}</span>
          </div>
        </>
      ) : (
        <div className="empty-result" data-testid="empty-transcript">
          <div className="empty-wave" aria-hidden="true">
            {[12, 25, 35, 19, 28, 13, 36, 21, 11, 29, 17].map((height, index) => (
              <i key={index} style={{ height }} />
            ))}
          </div>
          <strong>No transcript yet</strong>
          <span>Once the service processes your audio, your words will appear here.</span>
        </div>
      )}
    </section>
  );
}
