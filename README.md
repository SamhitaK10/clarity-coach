# 🎯 Clarity Coach

AI-powered workplace communication assistant that analyzes **nonverbal delivery** and **speech clarity** to help users build confidence in presentations and interviews.

Recent updates include unified backend integration, iris tracking improvements, and conversational coaching feedback.

---

## 🚀 What It Does

Clarity Coach provides personalized communication feedback through two coaching modes:

### 🎥 Presentation Coaching (Video)
Analyze nonverbal communication in short workplace recordings.

- Eye contact detection using MediaPipe iris tracking  
- Posture analysis (upright vs slouched)  
- Gesture activity tracking  
- Quantified delivery scores (0–100)  
- AI-generated coaching feedback  

### 🎤 Interview Coaching (Audio)
Practice spoken responses and improve clarity.

- Speech transcription  
- Clarity and confidence feedback  
- Grammar and phrasing suggestions  
- Filler word detection  
- Voice coaching playback  

---

## 🧰 Tech Stack

### Frontend
- HTML, CSS, JavaScript
- MediaRecorder API
- WebRTC

### Video Analysis Pipeline
- Python
- FastAPI
- MediaPipe Holistics + Iris Tracking
- OpenAI GPT-4o-mini

### Audio Coaching Pipeline
- Node.js
- Express
- OpenAI Whisper
- Anthrophic Claude
- ElevenLabs Voice Synthesis

### Infrastructure & Performance
- Modal GPU functions for accelerated video processing
- REST APIs for modular backend services

---

## 🏗 Architecture

Frontend routes users to two analysis pipelines:

- **Video pipeline:** MediaPipe → metric extraction → AI coaching  
- **Audio pipeline:** Whisper → Claude analysis → voice feedback  

Both services operate independently and communicate via REST endpoints.

---

## 📊 Metrics Generated

**Eye Contact Score**  
Measures gaze direction consistency using iris landmarks.

**Posture Score**  
Evaluates torso alignment to detect slouching.

**Gesture Score**  
Tracks wrist movement to measure engagement.

---

## ⚡ Quick Start

### 1. Install dependencies
```bash
pip install -r requirements.txt
cd backend-node && npm install && cd ..
