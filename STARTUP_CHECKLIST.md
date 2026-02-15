# Startup Checklist - MediaPipe Integration

Use this checklist to verify your integrated Clarity Coach app is working correctly.

---

## ✅ Pre-Flight Checks

### 1. Dependencies Installed

- [ ] **Node.js dependencies:**
  ```bash
  cd clarity-coach-frontend
  npm install
  cd frontend
  npm install
  ```

- [ ] **Python dependencies:**
  ```bash
  cd clarity-coach-cv/clarity-coach-cv/backend-python
  pip install -r requirements.txt
  ```

- [ ] **Frontend built:**
  ```bash
  cd clarity-coach-frontend/frontend
  npm run build
  ```

### 2. Environment Variables

- [ ] **Python backend .env exists:**
  ```bash
  ls clarity-coach-cv/clarity-coach-cv/backend-python/.env
  ```
  Should contain:
  - `OPENAI_API_KEY=...`
  - `LLM_PROVIDER=openai`
  - `LLM_MODEL=gpt-4o-mini`

- [ ] **Node.js backend .env exists:**
  ```bash
  ls clarity-coach-frontend/.env
  ```
  Should contain:
  - `OPENAI_API_KEY=...`
  - `ANTHROPIC_API_KEY=...`
  - `ELEVENLABS_API_KEY=...`

---

## 🚀 Startup Procedure

### Option A: Automatic Startup (Recommended)

**Windows:**
```bash
cd clarity-coach-frontend
start-both-backends.bat
```

**Mac/Linux:**
```bash
cd clarity-coach-frontend
chmod +x start-both-backends.sh
./start-both-backends.sh
```

- [ ] Two terminal windows opened
- [ ] Python backend window shows: "Uvicorn running on http://0.0.0.0:8000"
- [ ] Node.js backend window shows: "Server running on http://localhost:3000"

### Option B: Manual Startup

**Terminal 1 - Python Backend:**
```bash
cd clarity-coach-cv/clarity-coach-cv/backend-python
python run_server.py
```

- [ ] See: "INFO:     Uvicorn running on http://0.0.0.0:8000"
- [ ] No errors about missing modules

**Terminal 2 - Node.js Backend:**
```bash
cd clarity-coach-frontend
node server.js
```

- [ ] See: "✅ OpenAI API key loaded for transcription"
- [ ] See: "Server running on http://localhost:3000"
- [ ] No port conflict errors

---

## 🧪 Health Checks

### 1. Test Python Backend

```bash
curl http://localhost:8000/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "llm_provider": "openai",
  "llm_model": "gpt-4o-mini"
}
```

- [ ] Status 200 OK
- [ ] Returns JSON with "healthy" status

### 2. Test Node.js Backend

Open browser: http://localhost:3000

- [ ] Frontend loads successfully
- [ ] No CORS errors in browser console (F12)
- [ ] Landing page displays

### 3. Test API Documentation

Open browser: http://localhost:8000/docs

- [ ] FastAPI Swagger docs load
- [ ] See `/analyze-complete` endpoint
- [ ] See `/analyze` endpoint

---

## 🎥 Recording Test

### 1. Start Recording

1. Open: http://localhost:3000
2. Click "Start Recording"
3. Allow camera/microphone permissions

**Verify:**
- [ ] Camera preview shows your face
- [ ] Countdown timer appears and counts down
- [ ] Recording indicator visible

### 2. During Recording

Speak for 15-20 seconds while:
- Looking directly at the camera (for eye contact score)
- Sitting upright (for posture score)
- Using natural hand gestures (for gesture score)

**Verify:**
- [ ] Video feed is smooth
- [ ] Countdown is working
- [ ] Can hear yourself speaking

### 3. Stop Recording

Click "Stop Recording" or wait for countdown to reach 0.

**Verify:**
- [ ] Browser console shows: "Video blob created: [size] bytes"
- [ ] Navigates to processing page
- [ ] Processing page shows "Uploading video"

---

## 📊 Processing Test

### 1. Watch Processing Steps

**Frontend (browser):**
- [ ] Step 1: "Uploading video" (completes quickly)
- [ ] Step 2: "Analyzing speech & body language" (takes 15-30 sec)
- [ ] Step 3: "Generating performance scores" (takes 5-10 sec)
- [ ] Step 4: "Creating coaching insights" (completes)
- [ ] Progress bar reaches 100% and stops

### 2. Monitor Backend Logs

**Python Backend Terminal:**
```
Received video: recording.webm, size: X.XXmb
Video validation passed, sending to Modal for processing...
Processing video with MediaPipe...
Processed XXX frames. Metrics: {'eye_contact_score': XX, 'posture_score': XX, 'gesture_score': XX}
Generating coaching feedback with LLM...
Analysis complete!
```

- [ ] See "Received video"
- [ ] See "Processing video with MediaPipe"
- [ ] See actual metric scores (not null/undefined)
- [ ] See "Analysis complete"

**Node.js Backend Terminal:**
```
📥 Transcription request received
📊 File size: XXXXX bytes
🎤 Starting OpenAI Whisper transcription...
✅ Transcription successful: "[your words]"
```

- [ ] See transcription request
- [ ] See your actual transcript text
- [ ] No errors about "Processing failed"

### 3. Check Browser Console

Open browser console (F12):

**Should See:**
```
📤 Starting video processing... XXXXX bytes
📡 Sending video to Python backend...
✅ Complete analysis received: {nonverbal: {...}, verbal: {...}}
🚀 Navigating to results...
```

- [ ] See "Sending video to Python backend"
- [ ] See "Complete analysis received"
- [ ] No red error messages

**Should NOT See:**
- ❌ "Failed to fetch"
- ❌ "CORS error"
- ❌ "Network error"

---

## 🎯 Results Verification

### 1. Results Page Loads

- [ ] Overall score displayed (0-100)
- [ ] Four category scores shown:
  - Posture
  - Eye Contact
  - Clarity
  - Pacing
- [ ] Transcript visible
- [ ] Coaching feedback displayed

### 2. Body Language Scores Are Real

**Test Method:**
Record 2 videos with different behaviors:

**Video 1: Good Posture + Eye Contact**
- Sit upright, look at camera, speak clearly
- Expected: Posture > 80, Eye Contact > 80

**Video 2: Bad Posture + Looking Away**
- Slouch, look away from camera, speak clearly
- Expected: Posture < 65, Eye Contact < 60

- [ ] Scores change between videos
- [ ] Scores reflect actual behavior
- [ ] Posture/Eye Contact scores are NOT always 75-80

### 3. Feedback Quality

- [ ] Feedback mentions specific metrics
- [ ] Feedback is personalized (not generic)
- [ ] Strong moments listed
- [ ] Areas to improve listed
- [ ] Transcript matches what you said

---

## ❌ Common Failure Points

### Python Backend Won't Start

**Error:** `ModuleNotFoundError: No module named 'fastapi'`

**Fix:**
```bash
cd backend-python
pip install -r requirements.txt
```

---

### Node.js Backend Won't Start

**Error:** "EADDRINUSE: address already in use :::3000"

**Fix:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill //F //PID [PID]

# Mac/Linux
lsof -ti:3000 | xargs kill
```

---

### Processing Fails Immediately

**Symptom:** Processing page shows error right away

**Checks:**
1. Is Python backend running?
   ```bash
   curl http://localhost:8000/health
   ```

2. CORS configured?
   - Check `backend-python/app/config.py`
   - Should include `localhost:3000`

3. Browser console errors?
   - F12 → Console tab
   - Look for fetch/network errors

---

### Processing Takes Forever (>60 sec)

**Normal:** 20-40 seconds for 15-second video
**Too Long:** >60 seconds

**Possible Causes:**
- Video too long (reduce recording time)
- Video resolution too high (check recording settings)
- Slow CPU (MediaPipe is CPU-intensive)

**Fix:**
```typescript
// In recording-page.tsx, reduce resolution:
video: {
  width: { ideal: 640 },
  height: { ideal: 480 }
}
```

---

### Scores Always the Same

**Symptom:** Posture/Eye Contact always 75-80 regardless of behavior

**Diagnosis:** Frontend is NOT sending to Python backend

**Checks:**
1. Browser console: Does it say "Sending video to Python backend"?
2. Python terminal: Does it show "Received video"?
3. Network tab (F12): Is there a POST to `localhost:8000/analyze-complete`?

**Fix:**
```bash
# Rebuild frontend
cd frontend
npm run build
cd ..

# Restart Node.js backend
node server.js
```

---

## ✅ Success Criteria

Your integration is working correctly if:

- [✓] Both backends start without errors
- [✓] Can record video with camera preview
- [✓] Processing completes in 20-40 seconds
- [✓] Python backend logs show MediaPipe processing
- [✓] Results page shows transcript from your speech
- [✓] Body language scores change when you change behavior
- [✓] Feedback is specific and personalized

---

## 🎉 Final Test

### The Ultimate Integration Test

1. **Record Video 1:**
   - Sit upright
   - Look directly at camera
   - Use animated hand gestures
   - Speak clearly: "Hello, I'm testing the Clarity Coach application. This is my first recording with good posture and eye contact."

2. **Check Results:**
   - Posture score: Should be > 80
   - Eye Contact score: Should be > 80
   - Transcript: Should match what you said

3. **Record Video 2:**
   - Slouch in chair
   - Look away from camera (at desk/phone)
   - Keep hands still
   - Speak same words

4. **Check Results:**
   - Posture score: Should be < 65 (decreased!)
   - Eye Contact score: Should be < 60 (decreased!)
   - Transcript: Should still match words

5. **Compare:**
   - [ ] Scores changed significantly between videos
   - [ ] Feedback mentions different strengths/weaknesses
   - [ ] Both transcripts are accurate

**If all 5 steps pass → Integration is fully working! 🎉**

---

## 📞 Need Help?

If any check fails:

1. Review **INTEGRATION_GUIDE.md** - Detailed troubleshooting
2. Check **MEDIAPIPE_INTEGRATION_SUMMARY.md** - How it works
3. Review terminal logs for specific errors
4. Check browser console (F12) for frontend errors

Common error patterns and solutions are documented in the troubleshooting guides.

---

**Last Updated:** After MediaPipe integration
**Status:** Ready for testing 🚀
