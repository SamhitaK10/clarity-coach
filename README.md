# 🎯 Clarity Coach

AI-powered workplace communication assistant with dual coaching modes: **Video/Presentation Coaching** for nonverbal communication analysis, and **Audio/Interview Coaching** for speech clarity and confidence.

## Overview

Clarity Coach is a unified platform that helps professionals improve their workplace communication through AI-powered analysis and feedback.

### 🎥 Presentation Coaching (Video)
Analyze nonverbal communication in 30-60 second workplace videos:
- 👁️ Eye contact analysis using MediaPipe iris tracking
- 🧍 Posture assessment (upright vs. slouched)
- 👋 Gesture activity tracking
- 📊 Quantified metrics (0-100 scores)
- 🤖 AI coaching feedback (OpenAI GPT-4o-mini)

### 🎤 Interview Coaching (Audio)
Practice interview answers with AI feedback on speech:
- 🎙️ Audio transcription (OpenAI Whisper)
- 💡 Clarity and confidence feedback
- ✍️ Grammar and phrasing suggestions
- ⚠️ Filler word detection
- 🗣️ Voice synthesis coaching tips (ElevenLabs)
- 🤖 AI analysis (Claude/Anthropic)

## Architecture

Clarity Coach uses a **dual-backend architecture** to support both video and audio coaching:

```
                    ┌─────────────────┐
                    │   Frontend      │
                    │  Landing Page   │
                    └────────┬────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
      ┌──────────────────┐      ┌──────────────────┐
      │ Presentation     │      │ Interview        │
      │ Coaching         │      │ Coaching         │
      │ (presentation    │      │ (interview       │
      │  .html)          │      │  .html)          │
      └────────┬─────────┘      └────────┬─────────┘
               │                         │
               │ POST /analyze           │ POST /api/transcribe
               │ (video)                 │ (audio)
               ▼                         ▼
      ┌──────────────────┐      ┌──────────────────┐
      │ Python Backend   │      │ Node.js Backend  │
      │ FastAPI          │      │ Express          │
      │ Port 8000        │      │ Port 3000        │
      └────────┬─────────┘      └────────┬─────────┘
               │                         │
               ├─ MediaPipe              ├─ Whisper (OpenAI)
               │  Holistic + Iris        │
               │                         ├─ Claude (Anthropic)
               └─ OpenAI GPT-4o-mini     │
                  (feedback)             └─ ElevenLabs (voice)
```

### Components

1. **Frontend** (`frontend/`):
   - `index.html`: Landing page with mode selection
   - `presentation.html`: Video upload and nonverbal analysis results
   - `interview.html`: Audio recording/upload and speech analysis results

2. **Python Backend** (`backend-python/`):
   - FastAPI server for video processing (port 8000)
   - MediaPipe Holistic for nonverbal analysis
   - OpenAI GPT-4o-mini for coaching feedback

3. **Node.js Backend** (`backend-node/`):
   - Express server for audio processing (port 3000)
   - OpenAI Whisper for transcription
   - Claude/Anthropic for interview coaching analysis
   - ElevenLabs for voice synthesis (optional)

4. **Modal Functions** (optional): GPU-accelerated video processing for production

## Prerequisites

### Required:
- **Python 3.9+** (for video coaching backend)
- **Node.js 16+** (for audio coaching backend)
- **OpenAI API key**: [platform.openai.com](https://platform.openai.com) (used by both backends)

### For Interview Coaching:
- **Anthropic API key**: [console.anthropic.com](https://console.anthropic.com) (Claude for interview analysis)

### Optional:
- **ElevenLabs API key**: [elevenlabs.io](https://elevenlabs.io) (voice synthesis for audio feedback)
- **Modal account**: [modal.com](https://modal.com) (GPU acceleration for video processing)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/clarity-coach.git
cd clarity-coach
```

### 2. Install Python Dependencies

Install dependencies for video coaching (Python backend):

```bash
pip install -r requirements.txt
```

### 3. Install Node.js Dependencies

Install dependencies for audio coaching (Node.js backend):

```bash
cd backend-node
npm install
cd ..
```

### 4. Configure Environment Variables

Copy the example environment file and add your API keys:

```bash
cp .env.example .env
```

Then edit `.env` with your actual API keys:

```env
# =============================================================================
# OpenAI API (REQUIRED - Used by both backends)
# =============================================================================
OPENAI_API_KEY=sk-proj-YOUR_OPENAI_KEY_HERE

# =============================================================================
# Anthropic API (REQUIRED for Interview Coaching)
# =============================================================================
ANTHROPIC_API_KEY=sk-ant-YOUR_ANTHROPIC_KEY_HERE

# =============================================================================
# ElevenLabs API (OPTIONAL - for voice synthesis)
# =============================================================================
# ELEVENLABS_API_KEY=YOUR_ELEVENLABS_KEY_HERE

# =============================================================================
# Python Backend Configuration (Video/Presentation Coaching)
# =============================================================================
LLM_PROVIDER=openai
LLM_MODEL=gpt-4o-mini
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
MAX_VIDEO_SIZE_MB=50
MAX_VIDEO_DURATION_SECONDS=90

# =============================================================================
# Node.js Backend Configuration (Audio/Interview Coaching)
# =============================================================================
PORT=3000
NODE_ENV=development
```

### 5. Test Video Processing (Optional but Recommended)

Test video processing with a sample video:

```bash
# Add a test video to videos/ folder
python test_video_local.py
```

This validates MediaPipe is working correctly for presentation coaching.

## Usage

### Start Both Backend Servers

You need to run both backends simultaneously for full functionality.

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

Both servers will start with auto-reload enabled (changes to code auto-refresh).

### Access the Web Interface

Open your browser and navigate to:

```
http://localhost:8000
```

You'll see a landing page with two coaching modes:

1. **🎥 Presentation Coaching** - Video analysis for nonverbal communication
2. **🎤 Interview Coaching** - Audio analysis for speech clarity

### Using Presentation Coaching

1. Click **"Start Video Analysis"** from the landing page
2. **Upload Video**: Click the upload area or drag & drop a video file (MP4, AVI, MOV, WEBM)
3. **Analyze**: Click "Analyze Video" and wait 30-60 seconds (local CPU processing)
4. **Review Results**: View your eye contact, posture, and gesture metrics (0-100 scores)
5. **Read Feedback**: Get AI-powered coaching suggestions
6. **Iterate**: Upload another video to track improvement

### Using Interview Coaching

1. Click **"Start Interview Practice"** from the landing page
2. **Record or Upload**:
   - Click "Start Recording" to record your answer directly in the browser
   - OR upload an audio file (MP3, WAV, WEBM, M4A)
3. **Analyze**: Click "Get Feedback" and wait 10-30 seconds
4. **Review Results**:
   - Read your transcribed answer
   - View feedback on clarity, grammar, phrasing, and filler words
   - See an improved example sentence
   - Listen to voice coaching (if ElevenLabs API key is configured)
5. **Respond**: Answer the follow-up question to practice further

### Testing & Debugging

**Test local processing:**
```bash
python test_video_local.py
```

**Debug landmark detection:**
```bash
python debug_landmarks.py
```

These scripts help validate MediaPipe is detecting face, pose, and hands correctly.

### API Usage

Both backends expose REST APIs for programmatic access.

**Video Analysis API (Python - Port 8000):**

```bash
curl -X POST http://localhost:8000/analyze \
  -F "file=@your_video.mp4"
```

Response:
```json
{
  "metrics": {
    "eye_contact_score": 75.0,
    "posture_score": 82.0,
    "gesture_score": 65.0
  },
  "feedback": "• Your eye contact is strong...\n• Excellent posture...\n• Consider using more hand gestures...",
  "frame_count": 900
}
```

**Audio Analysis API (Node.js - Port 3000):**

```bash
curl -X POST http://localhost:3000/api/transcribe \
  -F "audio=@your_recording.mp3"
```

Response:
```json
{
  "transcript": "So, um, I believe my biggest strength is...",
  "feedback": {
    "clarity": "Your answer is clear but could be more concise.",
    "grammar": "Good grammar overall.",
    "phrasing": "Try starting with confidence without 'So, um'",
    "fillerWords": "Noticed: 'um' (1x), 'like' (2x). Try pausing instead.",
    "exampleSentence": "I believe my biggest strength is problem-solving...",
    "followUp": "Can you give a specific example?",
    "reply": "Good start! Try removing filler words for more confidence."
  },
  "audio": "data:audio/mpeg;base64,..." // Optional voice feedback
}
```

## Project Structure

```
clarity-coach/
├── backend-python/                      # Python backend (video coaching)
│   ├── app/
│   │   ├── main.py                      # FastAPI entry point
│   │   ├── config.py                    # Configuration management
│   │   ├── routes/
│   │   │   └── analyze.py               # POST /analyze endpoint
│   │   ├── services/
│   │   │   ├── modal_client_local.py    # Local MediaPipe processing
│   │   │   ├── modal_client.py          # Modal GPU client (optional)
│   │   │   └── llm_client.py            # OpenAI client
│   │   └── models/
│   │       └── schemas.py               # Pydantic models
│   └── tests/
├── backend-node/                        # Node.js backend (audio coaching)
│   ├── server.js                        # Express entry point
│   ├── routes/
│   │   ├── transcribe.js                # POST /api/transcribe (Whisper)
│   │   ├── analyze.js                   # POST /api/analyze (Claude)
│   │   └── voice-feedback.js            # POST /api/voice-feedback (ElevenLabs)
│   └── package.json
├── modal_functions/                     # Optional GPU acceleration
│   ├── mediapipe_processor.py           # Modal GPU function
│   ├── utils.py                         # Metric calculations
│   └── requirements.txt
├── frontend/                            # Unified web interface
│   ├── index.html                       # Landing page
│   ├── style.css                        # Landing page styles
│   ├── presentation.html                # Video coaching UI
│   ├── presentation-style.css           # Video page styles
│   ├── presentation-app.js              # Video page logic
│   ├── interview.html                   # Audio coaching UI
│   ├── interview-style.css              # Audio page styles
│   └── interview-app.js                 # Audio page logic
├── test_video_local.py                  # Local video testing script
├── debug_landmarks.py                   # Landmark detection debugger
├── requirements.txt                     # Python dependencies
├── .env.example                         # Environment template
├── .gitignore
├── CLAUDE.md                            # Project instructions
├── MERGE_PLAN.md                        # Merge strategy documentation
└── README.md
```

## Metrics Explained

### Eye Contact Score (0-100)

Measures the percentage of frames where the speaker appears to be looking at the camera. Uses MediaPipe iris landmarks (indices 468-477) to estimate gaze direction.

**Technical Note**: Requires `refine_face_landmarks=True` in MediaPipe Holistic to enable iris tracking (478 landmarks instead of 468).

- **90-100**: Excellent, consistent eye contact
- **70-89**: Good eye contact with occasional breaks
- **40-69**: Moderate, could be improved
- **0-39**: Limited eye contact, needs attention
- **0**: No face detected or iris tracking disabled

### Posture Score (0-100)

Evaluates upright posture based on shoulder-to-hip distance (torso length). Longer torso indicates upright posture, shorter suggests slouching.

- **90-100**: Excellent upright posture
- **70-89**: Good posture
- **40-69**: Somewhat slouched
- **0-39**: Poor posture, significantly slouched

### Gesture Score (0-100)

Measures hand movement activity by tracking wrist displacement between frames. Moderate gesturing scores highest, as both too little and too much can be distracting.

- **90-100**: Optimal natural gesturing
- **70-89**: Good gesture activity
- **40-69**: Either too few or too many gestures
- **0-39**: Very limited or excessive gesturing
- **0**: No hands detected in video (hands out of frame)

## Testing the Modal Function

You can test the Modal function independently:

```bash
# Create a test video or use an existing one
modal run modal_functions/mediapipe_processor.py --video-path path/to/test_video.mp4
```

This will process the video and display metrics without needing the full backend.

## Development

### Running Tests

```bash
cd backend
pytest tests/
```

### API Documentation

With the server running, visit:

```
http://localhost:8000/docs
```

For interactive API documentation (Swagger UI).

### Modifying Metrics

To adjust metric calculations, edit:

- `modal_functions/utils.py`: Raw feature extraction and score conversion
- Adjust thresholds in `convert_to_scores()` function

### Customizing LLM Prompts

To modify coaching feedback style, edit:

- `backend/app/services/llm_client.py`: Update `_create_coaching_prompt()` method

## Deployment

### Production Considerations

1. **Environment Variables**: Use secure secret management (not .env files)
2. **Dual Backend Coordination**:
   - Both backends must be accessible from frontend
   - Use reverse proxy (nginx) to route `/api/*` to Node.js (port 3000) and `/analyze` to Python (port 8000)
3. **Rate Limiting**: Add rate limiting to prevent abuse on both backends
4. **File Storage**: Currently files are processed in-memory and not stored
5. **CORS**: Update `cors_origins` in config for your production domain
6. **HTTPS**: Use a reverse proxy with SSL certificates
7. **Monitoring**: Add logging and error tracking (Sentry, etc.)
8. **API Keys**: Ensure all required keys (OpenAI, Anthropic) are configured

### Deploying to Cloud

**Python Backend Options:**
- Render, Railway, Fly.io (easiest)
- AWS EC2, Google Cloud Run, Azure App Service
- Heroku

**Node.js Backend Options:**
- Same platforms as Python (keep both backends on same host or use load balancer)
- Ensure both services can communicate if needed

**Frontend:**
- Can be served by Python backend (FastAPI static files)
- Or use separate static hosting (Vercel, Netlify, Cloudflare Pages)
- Update API endpoints to point to production URLs

**Modal Function:**
Already deployed via `modal deploy` - automatically scales with usage.

**Example Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:8000;
    }

    # Video analysis (Python)
    location /analyze {
        proxy_pass http://localhost:8000;
    }

    # Audio analysis (Node.js)
    location /api/ {
        proxy_pass http://localhost:3000;
    }
}
```

## Troubleshooting

### Modal Authentication Issues

**Modal doesn't need API keys in `.env`!** Authentication is handled via the CLI:

```bash
# Authenticate Modal (only need to do this once)
modal token new

# Verify authentication
modal token list

# Check if function is deployed
modal app list
```

Your Modal credentials are stored in `~/.modal.toml` automatically.

### Modal Function Not Found

If you get "Modal function not found" error:

```bash
# Ensure you're authenticated
modal token new

# Redeploy the function
modal deploy modal_functions/mediapipe_processor.py

# Verify deployment
modal app list
```

### Video Processing Fails

- Check video format (MP4, AVI, MOV, WEBM only)
- Ensure video has a visible face and person
- Try with a shorter video (under 60 seconds)
- Check Modal logs: `modal app logs clarity-coach-mediapipe`

### LLM Generation Fails

- Verify API key is set correctly in `.env`
- Check API quota/credits
- The app will fall back to rule-based feedback if LLM fails

### CORS Issues

If accessing from a different origin, update `cors_origins` in `.env`:

```env
CORS_ORIGINS=["http://localhost:3000", "https://yourdomain.com"]
```

## Limitations & Future Work

**Current Limitations:**
- **Video coaching**: Requires visible face and body, single-person videos only
- **Audio coaching**: English language only (Whisper supports others but feedback is English-focused)
- **Cultural bias**: Nonverbal communication norms are Western-centric
- **No persistence**: No user accounts, history, or progress tracking
- **Separate modes**: Video and audio analysis are independent (not combined)

**Planned Features:**
- **Unified Analysis**: Combine video + audio for complete communication assessment
- **User Accounts**: Save history, track progress over time
- **Multi-language**: Expand to support other languages
- **Real-time Coaching**: Live feedback during presentations/practice
- **Custom Profiles**: Different coaching styles for interviews vs. pitches vs. meetings
- **Sentiment Analysis**: Detect nervousness, confidence, enthusiasm
- **Collaborative Features**: Share feedback with mentors or coaches

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Quick Start

**For the impatient:**

```bash
# 1. Install dependencies
pip install -r requirements.txt
cd backend-node && npm install && cd ..

# 2. Configure .env with your API keys
cp .env.example .env
# Edit .env with your OPENAI_API_KEY and ANTHROPIC_API_KEY

# 3. Start both backends (in separate terminals)
cd backend-python && uvicorn app.main:app --reload --port 8000
cd backend-node && node server.js

# 4. Open browser
open http://localhost:8000
```

## Acknowledgments

**Video/Presentation Coaching:**
- Built with [MediaPipe](https://mediapipe.dev/) by Google
- [OpenAI GPT-4o-mini](https://openai.com) for coaching feedback
- Optional [Modal](https://modal.com) GPU infrastructure

**Audio/Interview Coaching:**
- [OpenAI Whisper](https://openai.com/research/whisper) for transcription
- [Claude/Anthropic](https://anthropic.com) for interview analysis
- [ElevenLabs](https://elevenlabs.io) for voice synthesis (optional)

## Support

For issues or questions:
- Open an issue on GitHub
- Check existing issues for solutions

---
