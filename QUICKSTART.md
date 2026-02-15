# 🚀 Quick Start Guide - Clarity Coach

Get Clarity Coach running in 5 minutes with both video and audio coaching!

## Prerequisites

- **Python 3.9+**
- **Node.js 16+**
- **OpenAI API key** ([platform.openai.com](https://platform.openai.com))
- **Anthropic API key** ([console.anthropic.com](https://console.anthropic.com))

---

## Installation Steps

### 1. Clone and Install Dependencies

```bash
# Clone repository
git clone https://github.com/yourusername/clarity-coach.git
cd clarity-coach

# Install Python dependencies (video coaching)
pip install -r requirements.txt

# Install Node.js dependencies (audio coaching)
cd backend-node
npm install
cd ..
```

### 2. Configure API Keys

```bash
# Copy template
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
# REQUIRED: OpenAI API (used by both backends)
OPENAI_API_KEY=sk-proj-YOUR_ACTUAL_KEY_HERE

# REQUIRED: Anthropic API (for interview coaching)
ANTHROPIC_API_KEY=sk-ant-YOUR_ACTUAL_KEY_HERE

# OPTIONAL: ElevenLabs (for voice synthesis)
# ELEVENLABS_API_KEY=YOUR_KEY_HERE
```

### 3. Start Both Backends

Open **two terminal windows**:

**Terminal 1 - Python Backend (Video Coaching):**
```bash
cd backend-python
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Node.js Backend (Audio Coaching):**
```bash
cd backend-node
node server.js
```

### 4. Open in Browser

Navigate to:
```
http://localhost:8000
```

---

## Using the Platform

### 🎥 Presentation Coaching (Video)

1. Click **"Start Video Analysis"** from landing page
2. Upload or drag & drop a video (30-60 seconds, MP4/MOV/WEBM)
3. Click **"Analyze Video"** and wait 30-60 seconds (local CPU processing)
4. Review your scores (all 0-100):
   - **Eye Contact** - How often you look at the camera
   - **Posture** - Upright vs. slouched posture
   - **Gestures** - Hand movement activity
   - **Smile** - Warmth and approachability
   - **Head Stability** - Confidence indicator
   - **Gesture Variety** - Engagement measure
5. Read AI coaching feedback
6. Language support: English and Spanish

**Tips:**
- Face the camera directly
- Ensure good lighting
- Keep hands visible for gesture tracking

### 🎤 Interview Coaching (Audio)

1. Click **"Start Interview Practice"** from landing page
2. Either:
   - Click **"Start Recording"** to record in browser
   - Or upload audio file (MP3, WAV, M4A, WEBM)
3. Click **"Get Feedback"** and wait 10-30 seconds
4. Review your feedback:
   - Transcript of your answer
   - Clarity, grammar, phrasing suggestions
   - Filler word detection
   - Improved example sentence
   - Voice coaching (if ElevenLabs configured)

**Tips:**
- Speak clearly into microphone
- Practice common interview questions
- Note filler words ("um", "like", "so")

---

## Troubleshooting

### "Connection refused" / "Network error"

Ensure both backends are running:
- Python on port 8000 ✓
- Node.js on port 3000 ✓

### Eye Contact Score Always 0

- MediaPipe needs `refine_face_landmarks=True` for iris tracking
- This is already set in the code
- Run `python debug_landmarks.py` to verify

### Invalid API Key

Check your `.env` file:
```bash
cat .env | grep API_KEY
```

Ensure keys start with:
- OpenAI: `sk-proj-`
- Anthropic: `sk-ant-`

### NumPy Version Conflict

```bash
pip install "numpy<2"
```

### Slow Processing

- **Video**: 30-60 seconds is normal for local CPU processing
  - Processing happens locally on your machine (no cloud required)
  - For 2-3x faster processing, optionally set up Modal GPU acceleration
- **Audio**: 10-30 seconds (depends on audio length and OpenAI API speed)

### Audio Transcription Fails

- Check audio file is not corrupted
- File must be under 10MB
- Verify OpenAI API key is valid

---

## Test Scripts

**Test video processing:**
```bash
# Test local MediaPipe processing with 6 metrics
python test_video_local.py
```

**Debug MediaPipe landmarks:**
```bash
# Verify face, pose, and hand detection
python debug_landmarks.py
```

---

## API Usage

### Video Analysis
```bash
curl -X POST http://localhost:8000/analyze \
  -F "file=@video.mp4"
```

### Audio Analysis
```bash
curl -X POST http://localhost:3000/api/transcribe \
  -F "audio=@recording.mp3"
```

---

## Next Steps

- **Full Documentation**: [README.md](README.md)
- **Project Structure**: [CLAUDE.md](CLAUDE.md)
- **API Docs**: http://localhost:8000/docs
- **Customize Metrics**: `modal_functions/utils.py`
- **Modify Prompts**:
  - Video: `backend-python/app/services/llm_client.py`
  - Audio: `backend-node/routes/analyze.js`

---

## Architecture

```
Landing Page (http://localhost:8000)
    │
    ├─► 🎥 Presentation Coaching
    │       └─► Python Backend (port 8000)
    │           ├─► MediaPipe Holistic
    │           └─► OpenAI GPT-4o-mini
    │
    └─► 🎤 Interview Coaching
            └─► Node.js Backend (port 3000)
                ├─► OpenAI Whisper
                ├─► Claude/Anthropic
                └─► ElevenLabs (optional)
```

---

## Support

For issues or questions:
- Open an issue on [GitHub](https://github.com/yourusername/clarity-coach/issues)
- Check existing issues for solutions
- Review full [README.md](README.md) for detailed docs
