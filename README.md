# 🎤 Interview Coaching API

Express backend powering Clarity Coach’s audio interview training.

---

## 🎯 Overview, Features, Architecture, Tech Stack, Setup, Usage & API

The Interview Coaching API powers the audio coaching experience in Clarity Coach. It transcribes spoken answers, analyzes communication clarity, and generates spoken coaching feedback to help users improve confidence, delivery, and fluency.

🎯 Purpose  
This service enables users to practice spoken responses and receive real-time communication feedback that improves clarity, confidence, and interview performance.

⚙️ Processing Pipeline  
Audio Input → Speech Transcription → AI Communication Analysis → Coaching Feedback → Voice Playback → Conversatio​nal Practice Loop

✨ Core Features  
• 🎙️ speech-to-text transcription  
• 💡 clarity and confidence coaching  
• ✍️ grammar and phrasing improvements  
• ⚠️ filler word detection  
• 🧠 AI-generated follow-up questions  
• 🗣️ voice coaching playback  
• 🔁 conversational coaching loop  
• 🎯 interview simulation practice  

🧠 How Conversational Coaching Works  
1. User records an answer in the browser  
2. Whisper transcribes the speech  
3. Claude analyzes clarity, delivery, and phrasing  
4. Coaching feedback is generated  
5. ElevenLabs converts feedback into spoken audio  
6. AI asks a follow-up question  
7. User responds and continues practice  

This creates a natural interview simulation experience.

🧰 Tech Stack  

Backend  
Node.js  
Express  

AI & Speech  
Openai Whisper — speech transcription  
Anthropic Claude — communication analysis  
ElevenLabs — voice synthesis  

Realtime & Audio  
MediaRecorder API  
getUserMedia  
WebRTC  

Utilities  
Multer — audio uploads  
dotenv — environment configuration  
node-fetch — external API requests  

🏗 Role in Clarity Coach Architecture  
This service powers the audio coaching pipeline:

Microphone Input → Transcription → AI Analysis → Voice Coaching → Practice Loop

It integrates with the video coaching backend to deliver full communication feedback.

🚀 Setup  

Install dependencies:

```bash
npm install
