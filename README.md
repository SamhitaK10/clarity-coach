# Clarity Coach - AI Interview Coaching Platform

An AI-powered interview coaching platform that records your practice sessions, provides detailed analysis with scores, and offers conversational coaching through voice interaction.

## 🎯 Features

### Core Functionality
- ✅ **Real-time Audio & Video Recording** - Webcam feed with audio capture
- ✅ **AI Transcription** - Converts speech to text using OpenAI Whisper
- ✅ **Performance Analysis** - Detailed scoring using Anthropic Claude
- ✅ **Results Dashboard** - Overall and category scores with insights
- ✅ **Voice Conversation** - Talk to AI coach after your session (OpenAI GPT-4o + ElevenLabs)

### Analysis Categories
- **Posture** - Body language and professional bearing
- **Eye Contact** - Camera engagement and focus
- **Clarity** - Speech articulation and pronunciation
- **Pacing** - Speaking speed and rhythm

### Interactive Features
- Live webcam preview during recording
- Filler word detection and highlighting
- Strong moments and areas for improvement
- Two-way voice conversation with AI coach

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Valid API keys for:
  - OpenAI (Whisper + GPT-4o)
  - Anthropic (Claude)
  - ElevenLabs (Text-to-Speech)

### Installation

\`\`\`bash
# 1. Install backend dependencies
npm install

# 2. Install frontend dependencies
cd frontend
npm install
cd ..

# 3. Add your API keys to .env file
# (Already has keys - regenerate for security!)
\`\`\`

### Running the Application

\`\`\`bash
# Build frontend
cd frontend
npm run build
cd ..

# Start backend (serves built frontend)
node server.js
\`\`\`

Open browser: **http://localhost:3000**

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
\`\`\`bash
# Find and kill process on port 3000
netstat -ano | findstr :3000
taskkill //F //PID [PID_NUMBER]
\`\`\`

### Recording/Transcription Issues
1. Open debug page: http://localhost:3000/test-recording.html
2. Test recording and see detailed logs
3. Check both browser console (F12) and terminal
4. See DEBUG_TRANSCRIPTION.md for detailed help

### API Key Issues
- Verify keys in .env file are valid (not revoked)
- Check you have credits on each platform
- Run: \`node test-openai.js\` to test keys

---

## 📁 Project Structure

\`\`\`
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
│   │   ├── services/api.ts
│   │   └── app/pages/
│   └── dist/                 # Built files
├── test-recording.html       # Debug page
└── README.md                 # This file
\`\`\`

---

## 📚 Documentation

- \`README.md\` - This file (overview)
- \`IMPLEMENTATION_SUMMARY.md\` - Technical details
- \`CONVERSATION_FEATURE.md\` - Voice chat docs
- \`DEBUG_TRANSCRIPTION.md\` - Debugging guide
- \`QUICK_START.md\` - Quick setup guide

---

## 🔒 Security

⚠️ **IMPORTANT**: .env file contains API keys
- Verify .env is in .gitignore
- Never commit API keys
- Regenerate keys if exposed

---

## 🛠️ Tech Stack

**Backend:** Node.js, Express, OpenAI, Anthropic, ElevenLabs
**Frontend:** React, TypeScript, Vite, TailwindCSS, Framer Motion

---

**Built with Claude Code** 🚀

For detailed implementation notes, see IMPLEMENTATION_SUMMARY.md
