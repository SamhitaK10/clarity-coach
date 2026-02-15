## 🎯 Clarity Coach
AI-powered workplace communication coach that helps users improve clarity, confidence, and delivery through real-time speech and nonverbal feedback.

Clarity Coach analyzes both **how you speak** and **how you present yourself**, providing actionable coaching to improve professional communication.

---

## 🎥 Presentation Coaching (Video)
Analyze nonverbal delivery in short workplace recordings:

- 👁️ Eye contact detection using MediaPipe iris tracking  
- 🧍 Postural alignment and slouch detection  
- 👋 Gesture activity analysis  
- 📊 Quantified delivery metrics (0–100 scores)  
- 🤖 AI-generated coaching feedback  

---

## 🎤 Interview Coaching (Audio)
Practice interview answers with AI-powered speech feedback:

- 🎙️ Speech transcription (OpenAI Whisper)  
- 💡 Clarity & confidence coaching  
- ✍️ Grammar & phrasing improvements  
- ⚠️ Filler word detection  
- 🗣️ Voice coaching playback (ElevenLabs)  
- 🤖 LLM analysis (Claude/Anthropic)  

---

## ⚙️ How It Works

**Video/Audio Input → AI Analysis → Coaching Feedback → Voice Guidance → Practice Loop**

Clarity Coach enables iterative improvement through conversational feedback.

---

## 🏗 Architecture

Clarity Coach uses a dual-backend system:

- **Python FastAPI backend** → video & nonverbal analysis  
- **Node.js Express backend** → speech analysis & voice feedback  
- **Frontend** → browser-based recording & playback  

---

## 🚀 Quick Start

### Install dependencies
```bash
pip install -r requirements.txt
cd backend-node && npm install && cd ..
