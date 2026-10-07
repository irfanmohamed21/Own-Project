from fastapi.testclient import TestClient

import main

client = TestClient(main.app)


def test_health_does_not_load_a_model():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "faster-whisper"}


def test_rejects_unsupported_file_type():
    response = client.post(
        "/api/transcribe",
        files={"file": ("notes.txt", b"not audio", "text/plain")},
        data={"model": "base", "language": "auto"},
    )

    assert response.status_code == 415
    assert "not supported" in response.json()["detail"].lower()


def test_rejects_empty_audio_file():
    response = client.post(
        "/api/transcribe",
        files={"file": ("empty.wav", b"", "audio/wav")},
        data={"model": "base", "language": "auto"},
    )

    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()


def test_transcription_returns_backend_result_without_fabricating_text(monkeypatch):
    expected = {
        "text": "A real transcript from the ASR backend.",
        "language": "en",
        "duration": 2.5,
        "processing_time": 0.8,
        "model": "base",
    }
    monkeypatch.setattr(
        main, "_run_transcription", lambda file_path, model, language: expected
    )

    response = client.post(
        "/api/transcribe",
        files={"file": ("sample.wav", b"audio bytes", "audio/wav")},
        data={"model": "base", "language": "auto"},
    )

    assert response.status_code == 200
    assert response.json() == expected


def test_model_load_failure_returns_service_unavailable(monkeypatch):
    def fail_to_load(file_path, model, language):
        raise main.ModelLoadError("model weights are unavailable")

    monkeypatch.setattr(main, "_run_transcription", fail_to_load)
    response = client.post(
        "/api/transcribe",
        files={"file": ("sample.wav", b"audio bytes", "audio/wav")},
        data={"model": "base", "language": "auto"},
    )

    assert response.status_code == 503
    assert "model" in response.json()["detail"].lower()
