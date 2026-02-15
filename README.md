## 🎤 Interview Coaching API

Express backend powering Clarity Coach’s audio interview training.

This service transcribes spoken answers, analyzes communication clarity, and generates spoken coaching feedback to help users improve confidence, delivery, and fluency.

---

## 🎯 Overview

The Interview Coaching API powers the audio coaching experience in Clarity Coach. It converts spoken responses into actionable communication feedback and delivers voice coaching to create a conversational practice loop.

It evaluates clarity, phrasing, grammar, pacing, and filler words, then provides spoken coaching and follow up prompts to simulate real interview practice.

---

## 🎯 Purpose

This service enables users to practice spoken responses and receive real time communication feedback to improve:

• clarity  
• confidence  
• fluency  
• delivery  
• interview performance  

---

## ⚙️ Processing Pipeline

Audio Input → Speech Transcription → AI Communication Analysis → Coaching Feedback → Voice Playback → Conversational Practice Loop

---

## ✨ Core Features

• 🎙️ speech to text transcription  
• 💡 clarity and confidence coaching  
• ✍️ grammar and phrasing improvements  
• ⚠️ filler word detection  
• 🧠 AI generated follow up questions  
• 🗣️ voice coaching playback  
• 🔁 conversational coaching loop  
• 🎯 interview simulation practice  

---

## 🧠 How Conversational Coaching Works

1. User records an answer in the browser  
2. OpenAI Whisper transcribes the speech  
3. Claude analyzes clarity, delivery, and phrasing  
4. Coaching feedback is generated  
5. ElevenLabs converts feedback into spoken audio  
6. AI asks a follow up question  
7. User responds and continues practice  

This creates a natural interview simulation experience.

---

## 🧰 Tech Stack

### Backend
Node.js  
Express  

### AI & Speech
OpenAI Whisper API — speech transcription  
Anthropic Claude API — communication analysis  
ElevenLabs API — voice synthesis  

### Realtime & Audio
OpenAI Realtime API — low latency conversational sessions  
WebRTC — real time audio streaming  
MediaRecorder API — in browser audio capture  
getUserMedia — microphone access  

### Utilities
Multer — audio uploads  
dotenv — environment configuration  
node-fetch — external API requests  

---

## 🏗 Role in Clarity Coach Architecture

This service powers the audio coaching pipeline:

Microphone Input → Transcription → AI Analysis → Voice Coaching → Practice Loop

It integrates with the video coaching backend to deliver complete communication feedback.

---

## 🚀 Setup

### 1. Install Dependencies

```bash
npm install
