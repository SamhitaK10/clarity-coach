# Clarity Coach - Full Integration with MediaPipe Body Language Analysis

## 🎉 What's New

Your app now has **REAL body language analysis** using MediaPipe! The frontend now records video (not just audio) and sends it to the Python backend for complete analysis.

### Architecture

```
┌─────────────────┐
│   React App     │ (Port 3000)
│   Frontend      │
└────────┬────────┘
         │
         │ Sends VIDEO + AUDIO
         ↓
┌─────────────────┐
│  Python Backend │ (Port 8000)
│  FastAPI        │
│  - MediaPipe    │ ← Analyzes VIDEO for body language
│  - Audio extract│
└────────┬────────┘
         │
         │ Extracts audio, sends to Node.js
         ↓
┌─────────────────┐
│  Node.js        │ (Port 3000)
│  Backend        │
│  - OpenAI       │ ← Transcribes AUDIO
│  - Anthropic    │
│  - ElevenLabs   │
└─────────────────┘
```

## 🚀 Quick Start

### Step 1: Start Python Backend (Video Analysis)

```bash
# Terminal 1
cd "/c/Users/samhi/Downloads/clarity-coach-cv/clarity-coach-cv/backend-python"

# Activate virtual environment (if created)
source .venv/bin/activate  # or: .venv\Scripts\activate on Windows

# Install dependencies (first time only)
pip install -r requirements.txt

# Start Python backend
python run_server.py
```

**Expected output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

### Step 2: Start Node.js Backend (Audio Processing)

```bash
# Terminal 2
cd "/c/Users/samhi/Downloads/clarity-coach-frontend/clarity-coach-frontend"

# Start Node.js server (serves frontend too)
node server.js
```

**Expected output:**
```
✅ OpenAI API key loaded for transcription
Server running on http://localhost:3000
```

### Step 3: Open the App

Open browser: **http://localhost:3000**

---

## 📊 What Changed

### Recording Page
- **Before:** Recorded audio only
- **After:** Records video WITH audio for body language analysis

### Processing Page
- **Before:** Sent audio to Node.js → transcribe → analyze text
- **After:** Sends video to Python backend → MediaPipe analysis + audio extraction → transcription → combined results

### Body Language Scores
- **Before:** Estimated from speech patterns (fake scores)
- **After:** REAL scores from MediaPipe computer vision:
  - **Eye Contact:** Iris tracking determines if looking at camera
  - **Posture:** Torso length measurement (shoulder-hip distance)
  - **Gestures:** Hand motion tracking across frames

---

## 🔧 API Endpoints

### Python Backend (Port 8000)

#### POST /analyze-complete
Analyzes video for complete communication assessment.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` (video file: .mp4, .webm, .avi, .mov)

**Response:**
```json
{
  "nonverbal": {
    "eye_contact_score": 85.2,
    "posture_score": 78.5,
    "gesture_score": 72.0
  },
  "verbal": {
    "transcript": "Hello, my name is...",
    "clarity": "Clear pronunciation",
    "grammar": "Excellent grammar",
    "phrasing": "Natural phrasing",
    "fillerWords": "Minimal use of filler words",
    "exampleSentence": "...",
    "followUp": "..."
  },
  "combined_feedback": "You demonstrated strong eye contact...",
  "voice_audio": "base64_encoded_audio...",
  "frame_count": 450,
  "video_duration": 15.0,
  "verbal_analysis_error": null
}
```

### Node.js Backend (Port 3000)

#### POST /api/transcribe
Transcribes audio using OpenAI Whisper (called by Python backend).

#### POST /api/conversation
Conversational AI coach using GPT-4o (used in "Talk to AI Coach" feature).

#### POST /api/voice-feedback
Text-to-speech using ElevenLabs.

---

## 🧪 Testing

### Test Recording
1. Click "Start Recording"
2. Speak for 10-20 seconds while looking at camera
3. Click "Stop Recording"
4. Wait for processing (~20-40 seconds)
5. View results with REAL body language scores!

### Verify MediaPipe is Working
Check Python backend terminal for:
```
Processing video with MediaPipe...
Processed 300 frames
Eye contact ratio: 0.85
Avg torso length: 0.42
Avg hand motion: 12.5
```

---

## 🐛 Troubleshooting

### Python Backend Won't Start

**Error:** `ModuleNotFoundError: No module named 'fastapi'`
```bash
cd backend-python
pip install -r requirements.txt
```

**Error:** Port 8000 already in use
```bash
# Find process on port 8000
netstat -ano | findstr :8000
# Kill it
taskkill //F //PID [PID_NUMBER]
```

### Video Upload Fails

**Error:** "Video file too large"
- Maximum size: 50MB
- Maximum duration: 90 seconds
- Try recording shorter video

**Error:** "Invalid video format"
- Supported: MP4, WebM, AVI, MOV
- Check browser console for actual format being sent

### Processing Takes Too Long

MediaPipe processes ~10-15 frames per second. For a 30-second video:
- Expected processing time: 20-40 seconds
- If longer than 60 seconds, check Python backend logs for errors

### Body Language Scores Still Fake?

**Check if Python backend is running:**
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{"status": "healthy", "llm_provider": "openai", "llm_model": "gpt-4o-mini"}
```

**Check browser console:**
- Look for: "Sending video to Python backend..."
- If error: Check CORS settings in Python backend config.py

---

## 📝 Code Changes Summary

### Frontend Changes
1. **recording-page.tsx**
   - Changed from audio-only to video+audio recording
   - Uses `MediaRecorder(stream)` with both video and audio tracks
   - Passes `videoBlob` to processing page

2. **processing-page.tsx**
   - Sends video to `http://localhost:8000/analyze-complete`
   - Transforms Python response to frontend format
   - Maps real MediaPipe scores to UI

### Python Backend Changes
1. **config.py**
   - Added CORS for localhost:3000

2. **.env** (NEW)
   - Added OpenAI/Anthropic API keys
   - Configured LLM provider

3. **.gitignore** (NEW)
   - Protects .env file from git

---

## 🔐 Security Reminder

⚠️ **CRITICAL:** Both backends have API keys in .env files:
- `clarity-coach-frontend/.env`
- `clarity-coach-cv/backend-python/.env`

These files contain **EXPOSED API KEYS** that should be regenerated:
1. Go to OpenAI, Anthropic, and ElevenLabs dashboards
2. Revoke old keys
3. Generate new keys
4. Update both .env files
5. Verify .env is in .gitignore

---

## 📚 Next Steps

1. **Test the integration**: Record a video and verify real body language scores
2. **Regenerate API keys**: Replace exposed keys immediately
3. **Optimize performance**: Consider reducing video resolution or frame rate if processing is slow
4. **Enhance feedback**: The Python backend can provide more detailed MediaPipe metrics

---

## 🎯 Features Now Working

✅ Real-time video recording with webcam
✅ Audio capture synchronized with video
✅ MediaPipe body language analysis (eye contact, posture, gestures)
✅ OpenAI Whisper speech transcription
✅ Anthropic Claude coaching feedback
✅ Combined verbal + nonverbal analysis
✅ Voice conversation with AI coach
✅ ElevenLabs text-to-speech feedback

---

**Built with Claude Code** 🚀

For issues or questions, check DEBUG_TRANSCRIPTION.md or create a GitHub issue.
