import { useEffect, useRef, useState } from "react";
import { Mic, Pause } from "lucide-react";
import { MAX_AUDIO_BYTES } from "@/utils/audio";

type AudioRecorderProps = {
  disabled?: boolean;
  onRecorded: (file: File, duration: number) => void;
  onError: (message: string) => void;
};

function elapsedLabel(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export function AudioRecorder({ disabled = false, onRecorded, onError }: AudioRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const startRef = useRef(0);

  useEffect(() => {
    if (!recording) return;
    const timer = window.setInterval(
      () => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)),
      250,
    );
    return () => window.clearInterval(timer);
  }, [recording]);

  useEffect(
    () => () => {
      const media = mediaRef.current;
      if (media) {
        media.onstop = null;
        media.ondataavailable = null;
        if (media.state === "recording") media.stop();
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
    },
    [],
  );

  async function startRecording() {
    onError("");
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      onError("Audio recording is not supported by this browser. Upload an audio file instead.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const supportedType = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
        "audio/ogg;codecs=opus",
      ].find((type) => MediaRecorder.isTypeSupported(type));
      const media = new MediaRecorder(stream, supportedType ? { mimeType: supportedType } : undefined);
      chunksRef.current = [];
      const startedAt = Date.now();

      media.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data);
      };
      media.onstop = () => {
        const recordingDuration = Math.max(0, (Date.now() - startedAt) / 1000);
        const blob = new Blob(chunksRef.current, { type: media.mimeType || "audio/webm" });
        const extension = blob.type.includes("mp4")
          ? "m4a"
          : blob.type.includes("ogg")
            ? "ogg"
            : "webm";
        const file = new File(
          [blob],
          `recording-${new Date(startedAt).toISOString().slice(0, 16).replace(/[:T]/g, "-")}.${extension}`,
          { type: blob.type },
        );
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setRecording(false);

        if (file.size > MAX_AUDIO_BYTES) {
          onError("This recording exceeded the 100 MB file limit. Record a shorter clip.");
          return;
        }
        if (!file.size) {
          onError("No audio was captured. Try recording again.");
          return;
        }
        onRecorded(file, recordingDuration);
      };

      mediaRef.current = media;
      startRef.current = startedAt;
      setElapsed(0);
      setRecording(true);
      media.start();
    } catch (error) {
      const name = error instanceof DOMException ? error.name : "";
      onError(
        name === "NotAllowedError" || name === "PermissionDeniedError"
          ? "Microphone access was blocked. Allow microphone access in your browser settings, then try again."
          : "The microphone could not be started. Check that it is connected and available.",
      );
    }
  }

  function stopRecording() {
    if (mediaRef.current?.state === "recording") mediaRef.current.stop();
  }

  return (
    <div className="record-bar">
      <span className="record-text">
        {recording ? (
          <>
            <i className="recording-dot" aria-hidden="true" />
            Recording · {elapsedLabel(elapsed)}
          </>
        ) : (
          <>
            <Mic size={14} />
            Prefer to speak? Record here.
          </>
        )}
      </span>
      {recording ? (
        <button
          className="btn btn-secondary"
          type="button"
          onClick={stopRecording}
          data-testid="button-stop-recording"
        >
          <Pause size={14} />
          Stop recording
        </button>
      ) : (
        <button
          className="btn btn-quiet"
          type="button"
          onClick={startRecording}
          disabled={disabled}
          data-testid="button-start-recording"
        >
          <Mic size={15} />
          Record
        </button>
      )}
    </div>
  );
}
