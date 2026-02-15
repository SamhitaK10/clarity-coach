# Clarity Coach - AI Interview Coaching Platform

An AI-powered interview coaching platform that records practice sessions, provides detailed speech analysis with scores, and offers conversational coaching through voice interaction.

## 🎯 Features

### Core Functionality
- ✅ **Real-time Audio & Video Recording** - Webcam feed with audio capture
- ✅ **AI Transcription** - Converts speech to text using OpenAI Whisper
- ✅ **Performance Analysis** - Detailed scoring using Anthropic Claude
- ✅ **Results Dashboard** - Overall and category scores with insights
- ✅ **Voice Conversation** - Talk to AI coach after your session (OpenAI GPT-4o + ElevenLabs)

### Analysis Categories
- **Posture** - Speech pattern analysis (estimated from audio)
- **Eye Contact** - Engagement indicators (estimated from audio)
- **Clarity** - Speech articulation and pronunciation
- **Pacing** - Speaking speed and rhythm

### Interactive Features
- Live webcam preview during recording
- Filler word detection and highlighting
- Strong moments and areas for improvement
- Two-way voice conversation with AI coach

---

## 🏗️ Architecture

```
Frontend (React + TypeScript)
    ↓
Node.js Backend (Express - Port 3000)
    ↓
OpenAI Whisper (Transcription)
    ↓
Anthropic Claude (Analysis & Coaching)
    ↓
ElevenLabs (Text-to-Speech)
    ↓
OpenAI GPT-4o (Conversational AI)
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Valid API keys for:
  - OpenAI (Whisper + GPT-4o)
  - Anthropic (Claude)
  - ElevenLabs (Text-to-Speech)

### Installation

```bash
# 1. Install backend dependencies
cd clarity-coach-frontend
npm install

# 2. Install frontend dependencies
cd frontend
npm install
cd ..

# 3. Configure API keys in .env file
# ⚠️ IMPORTANT: Regenerate exposed keys for security!
```

### Running the Application

```bash
# Build frontend (if not already built)
cd frontend
npm run build
cd ..

# Start backend (serves built frontend)
node server.js
```

**Open browser:** http://localhost:3000

---

## 📖 How to Use

### 1. Record Your Practice Session
1. Click "Start Recording"
2. Allow camera/microphone permissions
3. Speak your elevator pitch (10-45 seconds)
4. Click stop when done

### 2. View Your Analysis
- Wait 30-60 seconds for processing
- See overall score (0-100)
- Review category breakdowns
- Read transcript with filler words highlighted
- Check strong moments and areas to improve

### 3. Talk to Your AI Coach
1. Click **"Talk to AI Coach"** button
2. Press microphone and ask questions
3. AI responds in voice and text
4. Continue conversation naturally

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :3000
taskkill //F //PID [PID_NUMBER]

# Mac/Linux
lsof -ti:3000 | xargs kill
```

### Recording/Transcription Issues
1. Check browser console (F12) for errors
2. Verify microphone permissions are granted
3. Ensure you speak for at least 5 seconds
4. Check backend terminal for API errors

### API Key Issues
- Verify keys in .env file are valid (not revoked)
- Check you have credits on each platform
- Ensure no extra spaces in .env values

---

## 📁 Project Structure

```
clarity-coach-frontend/
├── server.js                  # Backend server
├── routes/                    # API endpoints
│   ├── transcribe.js         # OpenAI Whisper
│   ├── analyze.js            # Anthropic Claude
│   ├── voice-feedback.js     # ElevenLabs TTS
│   ├── conversation.js       # OpenAI GPT-4o
│   └── test-upload.js        # Debug endpoint
├── frontend/                  # React app
│   ├── src/
│   │   ├── services/api.ts   # API client
│   │   └── app/pages/        # React pages
│   │       ├── landing-page.tsx
│   │       ├── recording-page.tsx
│   │       ├── processing-page.tsx
│   │       └── results-page.tsx
│   └── dist/                 # Built files (served by Express)
├── test-recording.html       # Debug page
├── .env                      # API keys (DO NOT COMMIT)
└── README.md                 # This file
```

---

## 🔧 Key Components

### Backend Routes

#### POST /api/transcribe
Transcribes audio using OpenAI Whisper.

**Request:**
```
Content-Type: multipart/form-data
audio: [audio file]
```

**Response:**
```json
{
  "transcript": "Hello, my name is John..."
}
```

#### POST /api/analyze
Analyzes transcript using Anthropic Claude.

**Request:**
```json
{
  "transcript": "Hello, my name is John..."
}
```

**Response:**
```json
{
  "overallScore": 78,
  "categoryScores": {
    "posture": 82,
    "eyeContact": 71,
    "clarity": 85,
    "pacing": 75
  },
  "transcript": "...",
  "fillerWords": [...],
  "strongMoments": [...],
  "areasToImprove": [...],
  "feedback": "..."
}
```

#### POST /api/conversation
Conversational AI coach using GPT-4o.

**Request:**
```json
{
  "message": "How can I improve my eye contact?",
  "conversationHistory": [...],
  "analysisContext": {...}
}
```

#### POST /api/voice-feedback
Text-to-speech using ElevenLabs.

**Request:**
```json
{
  "text": "Great job on your presentation!"
}
```

**Response:**
```json
{
  "audio": "base64_encoded_audio..."
}
```

---

## 🔐 Security

⚠️ **IMPORTANT**: .env file contains API keys

**Current Status:**
- .env is in .gitignore ✅
- API keys are exposed in repository ⚠️

**Action Required:**
1. Go to OpenAI, Anthropic, and ElevenLabs dashboards
2. Revoke existing keys
3. Generate new keys
4. Update .env file
5. Never commit .env to version control

---

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **OpenAI API** - Whisper (transcription) + GPT-4o (conversation)
- **Anthropic API** - Claude (analysis)
- **ElevenLabs API** - Text-to-speech

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Framer Motion** - Animations
- **React Router** - Navigation

---

## 📊 API Usage & Costs

### OpenAI
- **Whisper API:** ~$0.006 per minute of audio
- **GPT-4o:** ~$0.01 per conversation turn

### Anthropic
- **Claude 3.5 Sonnet:** ~$0.015 per analysis

### ElevenLabs
- **Text-to-Speech:** ~$0.30 per 1,000 characters

**Estimated cost per session:** $0.02 - $0.05

---

## 🧪 Testing

### Debug Page
Open http://localhost:3000/test-recording.html for detailed recording diagnostics.

### Manual API Testing

**Test transcription:**
```bash
curl -X POST http://localhost:3000/api/transcribe \
  -F "audio=@test-audio.webm"
```

**Test analysis:**
```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"transcript": "Hello, my name is John..."}'
```

---

## 🚧 Known Limitations

1. **Body Language Scores:** Currently estimated from speech patterns, not actual video analysis
2. **Browser Support:** Best performance on Chrome/Edge (WebM support)
3. **Recording Length:** Limited to 45 seconds by frontend timer
4. **File Size:** Audio files limited to 25MB

---

## 🎓 Future Enhancements

### Planned Features
- [ ] Real video analysis with MediaPipe (body language detection)
- [ ] Multi-language support
- [ ] Session history and progress tracking
- [ ] Custom coaching scenarios
- [ ] Video playback with annotations
- [ ] Export results as PDF report

### Python MediaPipe Backend (In Progress)
A separate Python backend exists for real body language analysis:
- Location: `clarity-coach-cv/backend-python/`
- Features: Eye contact, posture, and gesture detection
- Status: Not integrated with main app yet
- See: `INTEGRATION_GUIDE.md` for details

---

## 📝 Development Notes

### Building Frontend
```bash
cd frontend
npm run build
```

### Running in Development Mode
```bash
# Terminal 1 - Backend
node server.js

# Terminal 2 - Frontend dev server
cd frontend
npm run dev
```

### Linting
```bash
cd frontend
npm run lint
```

---

## 🤝 Contributing

### Git Workflow
1. Create feature branch from main
2. Make changes and test thoroughly
3. Update documentation if needed
4. Commit with descriptive messages
5. Push and create pull request

### Commit Message Format
```
feat: Add voice conversation feature
fix: Resolve transcription timeout issue
docs: Update API documentation
refactor: Simplify audio recording logic
```

---

## 📄 License

This project is proprietary. All rights reserved.

---

## 🙏 Acknowledgments

- Built with [Claude Code](https://claude.com/claude-code) 🚀
- OpenAI for Whisper and GPT-4o
- Anthropic for Claude
- ElevenLabs for voice synthesis
- MediaPipe for computer vision capabilities

---

## 📞 Support

For issues or questions:
1. Check `DEBUG_TRANSCRIPTION.md` for troubleshooting
2. Review browser console and terminal logs
3. Verify API keys are valid
4. Ensure all dependencies are installed

---

**Last Updated:** February 2026
**Version:** 1.0.0 (Working Release)
**Status:** ✅ Production Ready (with audio-only analysis)

---

## 🔄 Version History

### v1.0.0 (Current)
- ✅ Audio recording and transcription
- ✅ AI analysis and coaching feedback
- ✅ Voice conversation feature
- ✅ Results dashboard with scores
- ⚠️ Body language scores estimated (not real video analysis)

### v2.0.0 (Planned)
- 🔄 Real MediaPipe body language analysis
- 🔄 Video analysis integration
- 🔄 Python backend integration
- 🔄 Enhanced accuracy for posture/eye contact scores
