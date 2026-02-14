# Interview Coaching API

Express backend for an interview coaching app: transcribe audio, get Claude coaching, and generate voice feedback with ElevenLabs.

## Setup

1. Copy `.env.example` to `.env` and add your API keys.
2. Install and run:

```bash
npm install
npm start
```

Dev mode with auto-reload: `npm run dev`

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/transcribe` | Upload an audio file (form field `audio`). Returns `{ text }` via OpenAI Whisper. |
| POST | `/api/analyze` | Send `{ transcript }` or `{ text }`, optional `question`. Returns `{ clarity, grammar, phrasing, fillerWords, exampleSentence }` for non-native English speakers. |
| POST | `/api/voice-feedback` | Send `{ text }`. Returns MP3 audio from ElevenLabs. |
| GET | `/health` | Health check. |

## Environment

- `OPENAI_API_KEY` – Whisper transcription
- `ANTHROPIC_API_KEY` – Claude coaching
- `ELEVENLABS_API_KEY` – Voice synthesis
- `ELEVENLABS_VOICE_ID` – (optional) Voice ID; default is Rachel
- `PORT` – Server port (default 3000)
