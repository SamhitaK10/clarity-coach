## 🎤 Interview Coaching API

Express-based backend powering the conversational audio coaching system for **Clarity Coach**, an AI-driven communication training platform.

This service captures spoken responses, performs speech transcription, evaluates communication clarity using large language models, and generates spoken coaching feedback to enable iterative, conversational practice.

---

## 🎯 System Overview

The Interview Coaching API enables real-time interview practice by transforming spoken responses into structured communication insights and spoken coaching feedback.

The system evaluates clarity, delivery, phrasing, pacing, and filler word usage, then produces actionable coaching guidance and follow-up prompts to simulate realistic interview dialogue.

This service is designed for low-latency feedback loops and conversational continuity.

---

## 🧠 Design Goals

• enable realistic interview simulation  
• provide actionable communication feedback  
• support iterative practice through conversational loops  
• maintain low-latency audio processing  
• separate frontend capture from backend analysis  
• support scalable AI-driven coaching workflows  

---

## ⚙️ End-to-End Processing Pipeline

Microphone Capture  
→ Browser MediaRecorder stream  
→ Multipart audio upload  
→ OpenAI Whisper API transcription  
→ Claude API communication analysis  
→ structured coaching generation  
→ ElevenLabs text-to-speech synthesis  
→ audio playback to client  
→ AI follow-up prompt generation  
→ continued conversational loop  

---

## ✨ Core Capabilities

### Speech Processing
• browser-based audio capture  
• multipart audio ingestion  
• high-accuracy speech-to-text transcription  

### Communication Analysis
• clarity evaluation  
• grammar and phrasing refinement  
• filler word detection and reduction strategies  
• delivery and pacing feedback  
• confidence and tone guidance  

### Conversational Coaching
• AI-generated follow-up questions  
• iterative practice loop  
• conversational response scaffolding  
• interview simulation flow  

### Voice Feedback
• low-latency TTS synthesis  
• natural spoken coaching delivery  
• base64 audio streaming to client  

---

## 🧠 Conversational Coaching Loop

1. user records interview response  
2. audio is captured via MediaRecorder  
3. Whisper API transcribes speech  
4. Claude API analyzes communication quality  
5. coaching feedback is generated  
6. ElevenLabs synthesizes spoken coaching  
7. AI produces follow-up prompt  
8. user responds and continues loop  

This loop creates a dynamic interview simulation environment rather than static feedback.

---

## 🏗 Architecture Role

This service powers the **audio coaching pipeline** within Clarity Coach.

It integrates with the video analysis backend to provide full-spectrum communication feedback.

