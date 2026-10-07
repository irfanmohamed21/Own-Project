import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { FileAudio2, Upload, X } from "lucide-react";
import { AUDIO_ACCEPT, formatFileSize } from "@/utils/audio";

type AudioUploaderProps = {
  file: File | null;
  duration?: number;
  disabled?: boolean;
  onSelect: (file: File) => void;
  onRemove: () => void;
  onDuration: (seconds: number) => void;
};

export function AudioUploader({
  file,
  duration,
  disabled = false,
  onSelect,
  onRemove,
  onDuration,
}: AudioUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [audioSource, setAudioSource] = useState("");
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!file) {
      setAudioSource("");
      return;
    }
    const source = URL.createObjectURL(file);
    setAudioSource(source);
    return () => URL.revokeObjectURL(source);
  }, [file]);

  function onInputChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    if (selected) onSelect(selected);
    event.target.value = "";
  }

  return (
    <>
      <div
        className={`dropzone ${dragging ? "dragging" : ""}`}
        data-testid="dropzone-audio"
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (disabled) return;
          const dropped = event.dataTransfer.files[0];
          if (dropped) onSelect(dropped);
        }}
      >
        <div className="upload-icon">
          <Upload size={19} />
        </div>
        <div className="drop-main">Drop an audio file here</div>
        <div className="drop-detail">WAV, MP3, M4A, MP4 and more · up to 100 MB</div>
        <input
          ref={inputRef}
          type="file"
          accept={AUDIO_ACCEPT}
          onChange={onInputChange}
          disabled={disabled}
          hidden
          data-testid="input-audio-file"
          aria-label="Choose an audio file"
        />
        <button
          className="btn btn-secondary"
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          data-testid="button-browse-audio"
        >
          Browse files
        </button>
      </div>

      {file && (
        <div className="file-row" data-testid="file-selected">
          <div className="file-type">
            <FileAudio2 size={18} />
          </div>
          <div className="file-info">
            <div className="file-name" title={file.name} data-testid="text-selected-filename">
              {file.name}
            </div>
            <div className="file-meta">
              {formatFileSize(file.size)}
              {duration !== undefined ? ` · ${duration.toFixed(1)} sec` : ""}
            </div>
          </div>
          <audio
            controls
            src={audioSource}
            onLoadedMetadata={(event) => {
              const length = event.currentTarget.duration;
              if (Number.isFinite(length)) onDuration(length);
            }}
            style={{ width: 150, maxWidth: "32%" }}
            aria-label={`Preview ${file.name}`}
            data-testid="audio-preview"
          />
          <button
            className="btn btn-quiet"
            type="button"
            disabled={disabled}
            aria-label="Remove audio file"
            onClick={onRemove}
            data-testid="button-remove-file"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </>
  );
}
