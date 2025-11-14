# Troubleshooting & Notes

This document contains quick fixes and notes for problems you may encounter during development.

1) Groq + httpx compatibility

- Symptom: Backend crashes during startup with errors like "AsyncClient.__init__() got an unexpected keyword argument 'proxies'" or attribute errors from `httpx`.
- Cause: `groq` Python client wraps an `httpx` client; incompatible `httpx` versions can change internals / kwargs.
- Fixes:
  - Preferred: Install a `httpx` version compatible with the installed `groq` package (check `pip show groq`). For example, the project has been tested with `httpx` in the 0.23–0.28 range, but specific groq versions may expect `httpx==0.27`.
  - Alternative: If you cannot change packages (network restrictions), apply a tiny compatibility wrapper in code to adapt unexpected kwargs (advanced).

2) Translation service choices

- The project historically used the Bhashini API (official Indian govt translation) — requires credentials and is sometimes slow.
- For demos: use small online wrappers (e.g., `translate`, `googletrans`), but these introduce dependency risks. If you need offline, IndicTrans2 (ai4bharat) is an option but requires heavy dependencies (fairseq, model downloads).

3) Whisper & ffmpeg

- Symptom: Whisper fails to process audio with format errors.
- Fix: Ensure `ffmpeg` is installed and on PATH. On macOS with Homebrew: `brew install ffmpeg`.

4) Quick debugging tips

- Use an import test to verify Python imports quickly:

```bash
source venv/bin/activate
python -c "from app.main import app; print('imports OK')"
```

- Check logs printed by Uvicorn for detailed stack traces; backend `--reload` will show issues on import.
