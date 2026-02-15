## 🎤 Interview Coaching API

Express backend powering Clarity Coach’s audio interview training.

This service transcribes spoken answers, analyzes communication clarity, and generates spoken coaching feedback to help users improve confidence and delivery.

---

## 🎯 Overview

The Interview Coaching API enables users to practice spoken responses and receive real-time communication feedback.

It evaluates clarity, phrasing, grammar, and filler words, then delivers voice coaching to guide improvement.

---

## ⚙️ Pipeline

Audio Input → Transcription → AI Analysis → Coaching Feedback → Voice Playback → Practice Loop

---

## ✨ Features

- 🎙️ Speech-to-text transcription  
- 💡 Clarity & confidence coaching  
- ✍️ Grammar & phrasing improvements  
- ⚠️ Filler word detection  
- 🧠 AI-generated follow-up questions  
- 🗣️ Voice coaching playback  
- 🔁 Conversational coaching loop  

---

## 🧰 Tech Stack

**Backend**
- Node.js
- Express

**AI & Speech**
- OpenAI Whisper (speech-to-text)
- Anthropic Claude (communication analysis)
- ElevenLabs (voice synthesis)

**Realtime & Audio**
- WebRTC
- MediaRecorder API
- getUserMedia

**Utilities**
- Multer (file uploads)
- dotenv (environment configuration)

---

## 🏗 Role in Clarity Coach Architecture

This service powers the audio coaching pipeline:

Microphone Input → Transcription → AI Analysis → Voice Coaching → Practice Loop

---

## 🚀 Setup

### Install dependencies
```bash
npm install
