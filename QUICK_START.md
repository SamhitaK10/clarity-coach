# Quick Start Guide

## 🚨 BEFORE YOU START - SECURITY CRITICAL

Your API keys are exposed in the `.env` file. **IMMEDIATELY:**

1. **Revoke these keys:**
   - OpenAI: https://platform.openai.com/api-keys
   - Anthropic: https://console.anthropic.com/settings/keys
   - ElevenLabs: https://elevenlabs.io/app/settings/api-keys

2. **Generate new keys** from each platform

3. **Update `.env` file** with new keys:
```env
PORT=3000
OPENAI_API_KEY=your-new-key-here
ANTHROPIC_API_KEY=your-new-key-here
ELEVENLABS_API_KEY=your-new-key-here
```

---

## Start the Application

### Option 1: Quick Test (Built Frontend)

```bash
# From the project root
cd /c/Users/samhi/Downloads/clarity-coach-frontend/clarity-coach-frontend

# Start the server
node server.js
```

Then open: **http://localhost:3000**

### Option 2: Development Mode

Terminal 1 - Backend:
```bash
cd /c/Users/samhi/Downloads/clarity-coach-frontend/clarity-coach-frontend
node server.js
```

Terminal 2 - Frontend:
```bash
cd /c/Users/samhi/Downloads/clarity-coach-frontend/clarity-coach-frontend/frontend
npm run dev
```

---

## Test the Application

### 1. Record Audio
- Click "Start Recording"
- Allow microphone access
- Click the red circle button
- Speak for 10-20 seconds
- Click the red square to stop

### 2. Processing
Watch as your audio is:
- Uploaded
- Transcribed by OpenAI Whisper
- Analyzed by Anthropic Claude
- Scored and evaluated

### 3. View Results
See your:
- Overall score (0-100)
- Category scores (Posture, Eye Contact, Clarity, Pacing)
- Full transcript with filler words highlighted
- Strong moments
- Areas for improvement

### 4. Talk to AI Coach (NEW!)
- Click "Talk to AI Coach" button
- Press microphone to speak
- Ask questions like:
  - "How can I improve my pacing?"
  - "What did I do well?"
  - "Give me a specific tip to practice"
- AI responds in voice and text
- Have a natural back-and-forth conversation

---

## Verify Everything Works

### Check Backend Health
```bash
curl http://localhost:3000/health
```

Expected: `{"status":"ok","message":"Interview coaching API is running"}`

### Check Environment Variables
When you start the server, you should see:
```
==================================================
ENVIRONMENT VARIABLES LOADED:
OPENAI_API_KEY loaded: true
ANTHROPIC_API_KEY loaded: true
ELEVENLABS_API_KEY loaded: true
==================================================
Server running on http://localhost:3000
```

---

## Common Issues

### Port 3000 Already in Use
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or change port in .env
PORT=3001
```

### Microphone Not Working
- Check browser permissions
- Try Chrome or Edge (best compatibility)
- Test microphone in other apps first

### API Errors
- Verify API keys are valid (not revoked)
- Check you have credits/quota on OpenAI and Anthropic
- Look at backend console for detailed errors

---

## What Changed

The application now has:
✅ Real audio recording (not fake)
✅ Real API integration (not mock data)
✅ Working backend connection
✅ Actual AI analysis with scores

See `IMPLEMENTATION_SUMMARY.md` for full details.
