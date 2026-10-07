# ASR Tool – Automatic Speech Recognition System

An academic speech-to-text application for converting uploaded or recorded audio into text. The React frontend sends the audio to the included Python FastAPI service, which runs the selected faster-whisper model. The app displays only a valid response from that service; it does not generate sample or placeholder transcripts.

## Features

- Upload or drag in audio/video files, inspect the filename and file size, and preview audio before transcription.
- Record from a microphone, see the recording timer, then preview the captured audio.
- Choose `tiny`, `base`, `small`, or `medium` recognition models.
- Automatically detect speech language or select from the languages supported by Whisper, including English, Tamil, Hindi, Malayalam, Telugu, and Kannada.
- See returned transcript text, detected language, processing time, model, and audio duration.
- Copy the transcript, download it as a `.txt` file, or clear the current result.
- Review, reopen, and delete previous transcripts saved locally in the browser.
- Responsive transcription, history, and about pages.
- Friendly messages for invalid files, oversized uploads, microphone permissions, unreachable services, timeouts, and invalid responses.
- No account, API key, or cloud history is required.

Audio upload limit: **100 MB** in both the frontend and included backend. Transcript history is stored in browser `localStorage`; uploaded audio is not included in history.

## Technologies

| Frontend | Backend |
| --- | --- |
| React | Python |
| TypeScript | FastAPI |
| Tailwind CSS | faster-whisper |
| Vite | FFmpeg |

The frontend also uses Wouter for page routing and browser APIs for microphone recording, audio preview, clipboard access, downloads, and local history.

## Architecture

```text
User
  ↓
React + TypeScript frontend
  ↓ multipart/form-data
FastAPI POST /api/transcribe
  ↓
faster-whisper model + FFmpeg audio decoding
  ↓ JSON transcript and metadata
Frontend result and browser-local history
```

The backend runs as a separate Python service so it can be hosted on a machine with the required CPU/GPU resources. Its source and dependencies are in `backend/`.

## Installation

### Frontend

From the repository root:

```sh
pnpm install
cp .env.example .env.local
```

Edit `.env.local` if the backend is not running at `http://localhost:8000`.

### Backend

Use Python 3.10 or later, install FFmpeg, and verify it is on the system path:

```sh
ffmpeg -version
cd backend
python -m pip install -r requirements.txt
```

For the included API tests, install the development dependencies instead:

```sh
python -m pip install -r requirements-dev.txt
```

The first transcription downloads the selected faster-whisper model if it is not already cached. Model downloads can be large; `medium` needs more memory and processing time than the smaller choices.

## Environment variables

### Frontend (`.env.example`)

```env
VITE_API_URL=http://localhost:8000
```

`VITE_API_URL` is the backend base URL, without `/api/transcribe` at the end. Vite reads this variable when the frontend starts/builds. For a hosted frontend, use a backend URL reachable by the user's browser and configure the backend CORS allow-list for that frontend origin. Use HTTPS for both when deploying publicly.

### Backend (`backend/.env.example`)

| Variable | Default | Purpose |
| --- | --- | --- |
| `CORS_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173` | Comma-separated frontend origins allowed to call the API |
| `WHISPER_DEVICE` | `cpu` | faster-whisper device, for example `cpu` or `cuda` on a correctly configured host |
| `WHISPER_COMPUTE_TYPE` | `int8` | CTranslate2 compute type; change it only to a type supported by the host |
| `WHISPER_MODEL_DIR` | faster-whisper default cache | Optional path for downloaded model files |
| `MAX_UPLOAD_BYTES` | `104857600` | Maximum request file size in bytes |

FastAPI does not automatically load the example file. Export the variables in the backend process environment or configure them through the hosting provider. Add the deployed frontend's exact origin to `CORS_ORIGINS`; do not use `*` for a public deployment.

## Running the application

Start the backend in one terminal:

```sh
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

Start the frontend in another terminal from the repository root:

```sh
PORT=5173 BASE_PATH=/ pnpm run dev
```

Open the frontend address printed by Vite. The browser must be able to reach the configured FastAPI URL. On Replit, use the app's managed web preview for the frontend; the Python backend still needs to run at a browser-reachable URL and allow that preview's origin through CORS.

## Backend integration and API endpoint

The frontend's API service in `src/services/api.ts` reads `VITE_API_URL` in one place and sends a `multipart/form-data` request:

```http
POST {VITE_API_URL}/api/transcribe
Content-Type: multipart/form-data
```

Form fields:

| Field | Example | Description |
| --- | --- | --- |
| `file` | `lecture.wav` | Audio or supported video file |
| `model` | `base` | `tiny`, `base`, `small`, or `medium` |
| `language` | `auto` | `auto` or a Whisper language code such as `en` or `ta` |

The included FastAPI implementation in `backend/main.py` exposes this endpoint and uses the selected faster-whisper model. Its successful response follows this contract:

```json
{
  "text": "Transcribed speech here",
  "language": "en",
  "duration": 12.4,
  "processing_time": 3.2,
  "model": "base"
}
```

`GET /health` checks that the service is responding without loading a model. The transcription route validates the model, file extension, language format, and upload size; writes uploads to a temporary file; and removes the temporary file after the request. Backend error responses are translated into user-friendly messages by the frontend. The frontend rejects a success response that does not match the required fields and never inserts an example transcript.

## Testing

Run frontend static checks and production build from the repository root:

```sh
pnpm run typecheck
PORT=5173 BASE_PATH=/ pnpm run build
```

Run the backend API tests (the successful-transcription test replaces the model call, so it does not download a model):

```sh
cd backend
python -m pytest
```

For a real end-to-end transcription, start both services and submit a short, non-sensitive audio recording. The actual transcript and metadata must come from faster-whisper.

## GitHub setup

1. Create a repository for the project and commit the source files, including `backend/requirements.txt` and `.env.example`.
2. Do not commit `.env.local`, private environment files, downloaded model weights, audio recordings, or generated transcripts.
3. Configure `VITE_API_URL` in the frontend host and `CORS_ORIGINS` in the backend host.
4. Keep the backend endpoint and model setup documented so another student can run the project.

## Future improvements

- Word-level timestamps and subtitle export.
- Speaker diarization and research annotation workflows.
- Progress updates for long recordings.
- Optional encrypted, server-side history for multi-device use.
- A hosted GPU backend for larger Whisper models.
