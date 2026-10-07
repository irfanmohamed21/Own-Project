"""FastAPI service for real faster-whisper speech transcription."""

from __future__ import annotations

import logging
import os
import re
import tempfile
import threading
import time
from pathlib import Path
from typing import Literal

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel
from pydantic import BaseModel

logger = logging.getLogger("asr_backend")
logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO").upper())

MAX_UPLOAD_BYTES = int(os.getenv("MAX_UPLOAD_BYTES", str(100 * 1024 * 1024)))
ALLOWED_MODELS = {"tiny", "base", "small", "medium"}
ALLOWED_EXTENSIONS = {
    ".aac",
    ".flac",
    ".m4a",
    ".mkv",
    ".mov",
    ".mp3",
    ".mp4",
    ".mpeg",
    ".mpga",
    ".oga",
    ".ogg",
    ".opus",
    ".wav",
    ".webm",
    ".wma",
}
LANGUAGE_CODE = re.compile(r"^[a-z]{2,3}$")

_models: dict[str, WhisperModel] = {}
_model_lock = threading.Lock()


class ModelLoadError(RuntimeError):
    """Raised when a requested faster-whisper model cannot be initialized."""


class TranscriptionResponse(BaseModel):
    text: str
    language: str
    duration: float
    processing_time: float
    model: str


def _get_model(model_name: str) -> WhisperModel:
    """Load each requested model once, only when it is first needed."""
    cached = _models.get(model_name)
    if cached is not None:
        return cached

    with _model_lock:
        cached = _models.get(model_name)
        if cached is None:
            try:
                cached = WhisperModel(
                    model_name,
                    device=os.getenv("WHISPER_DEVICE", "cpu"),
                    compute_type=os.getenv("WHISPER_COMPUTE_TYPE", "int8"),
                    download_root=os.getenv("WHISPER_MODEL_DIR") or None,
                )
            except Exception as exc:
                raise ModelLoadError(
                    f"Unable to initialize the {model_name} model."
                ) from exc
            _models[model_name] = cached
    return cached


def _run_transcription(
    file_path: str, model_name: str, language: str | None
) -> TranscriptionResponse:
    model = _get_model(model_name)
    started_at = time.perf_counter()
    segments, info = model.transcribe(
        file_path,
        language=language,
        beam_size=5,
        vad_filter=True,
    )
    text = " ".join(segment.text.strip() for segment in segments).strip()
    processing_time = time.perf_counter() - started_at

    return TranscriptionResponse(
        text=text,
        language=info.language,
        duration=float(info.duration),
        processing_time=round(processing_time, 3),
        model=model_name,
    )


app = FastAPI(
    title="ASR Tool API",
    description="Speech transcription API powered by faster-whisper.",
    version="1.0.0",
)

cors_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
    ).split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)


@app.get("/health")
async def health() -> dict[str, str]:
    """Simple availability check; it does not load or simulate an ASR model."""
    return {"status": "ok", "service": "faster-whisper"}


@app.post("/api/transcribe", response_model=TranscriptionResponse)
async def transcribe(
    file: UploadFile = File(...),
    model: Literal["tiny", "base", "small", "medium"] = Form("base"),
    language: str = Form("auto"),
) -> TranscriptionResponse:
    """Transcribe an uploaded audio/video file using a real Whisper model."""
    if model not in ALLOWED_MODELS:
        raise HTTPException(status_code=422, detail="Choose a supported model.")

    if language != "auto" and not LANGUAGE_CODE.fullmatch(language):
        raise HTTPException(status_code=422, detail="Choose a supported language code.")

    filename = file.filename or ""
    suffix = Path(filename).suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=415,
            detail="This file type is not supported. Upload a common audio or video file.",
        )

    temp_path: str | None = None
    total_bytes = 0
    try:
        with tempfile.NamedTemporaryFile(
            mode="wb", suffix=suffix, prefix="asr-upload-", delete=False
        ) as temp_file:
            temp_path = temp_file.name
            while chunk := await file.read(1024 * 1024):
                total_bytes += len(chunk)
                if total_bytes > MAX_UPLOAD_BYTES:
                    raise HTTPException(
                        status_code=413,
                        detail="This file is too large. The maximum upload size is 100 MB.",
                    )
                temp_file.write(chunk)

        if total_bytes == 0:
            raise HTTPException(
                status_code=400, detail="The selected audio file is empty."
            )

        normalized_language = None if language == "auto" else language.lower()
        try:
            return await run_in_threadpool(
                _run_transcription, temp_path, model, normalized_language
            )
        except Exception as exc:
            logger.exception("Transcription failed")
            if isinstance(exc, ModelLoadError):
                raise HTTPException(
                    status_code=503,
                    detail="The selected ASR model could not be loaded. Check the backend setup and try again.",
                ) from exc
            raise HTTPException(
                status_code=422,
                detail="Transcription failed. Check that the audio is clear and try again.",
            ) from exc
    finally:
        await file.close()
        if temp_path:
            try:
                Path(temp_path).unlink(missing_ok=True)
            except OSError:
                logger.warning("Could not remove temporary upload file")
