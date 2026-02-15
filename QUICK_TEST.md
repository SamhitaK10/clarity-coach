# Quick Test - MediaPipe Integration

**Goal:** Verify body language scores are REAL in under 5 minutes.

---

## 🚀 Start Both Backends

### Windows (Double-click):
```
start-both-backends.bat
```

### Mac/Linux:
```bash
chmod +x start-both-backends.sh
./start-both-backends.sh
```

**Wait for both windows to show:**
- Python: "Uvicorn running on http://0.0.0.0:8000"
- Node.js: "Server running on http://localhost:3000"

---

## 🎥 Record Test Video

1. **Open:** http://localhost:3000
2. **Click:** "Start Recording"
3. **Allow:** Camera/microphone permissions
4. **Speak for 15 seconds:**
   - **Sit UPRIGHT** (straight back)
   - **Look AT camera** (not away)
   - Say: "This is my first test with good posture and eye contact"
5. **Click:** "Stop Recording"

---

## ⏱️ Wait for Processing (20-40 seconds)

**Watch for:**
- "Uploading video" → "Analyzing speech & body language" → "Generating performance scores"

**Python Terminal Should Show:**
```
Received video: recording.webm
Processing video with MediaPipe...
Processed XXX frames. Metrics: {'eye_contact_score': 85, 'posture_score': 82, ...}
Analysis complete!
```

---

## ✅ Check Results

**Expected if MediaPipe is working:**
- **Posture:** 75-90 (because you sat upright)
- **Eye Contact:** 75-90 (because you looked at camera)
- **Transcript:** Shows what you said
- **Feedback:** Mentions your posture/eye contact

---

## 🔄 Verify It's REAL (Not Fake)

### Test 2: Bad Posture + Looking Away

1. **Click:** "Back" → "Start Recording"
2. **This time:**
   - **SLOUCH** (lean back/forward)
   - **Look AWAY** from camera (at keyboard/desk)
   - Say the SAME words
3. **Stop Recording**
4. **Wait for results**

### Expected Results:
- **Posture:** 50-65 (LOWER than first video!)
- **Eye Contact:** 45-60 (LOWER than first video!)
- **Transcript:** Still accurate

---

## 🎉 Success Criteria

**✅ Integration is working if:**
- [ ] Video 1 (good): Posture > 75, Eye Contact > 75
- [ ] Video 2 (bad): Posture < 65, Eye Contact < 60
- [ ] Scores CHANGED between videos
- [ ] Python terminal showed "Processing video with MediaPipe"

**❌ Integration NOT working if:**
- [ ] Scores always same (e.g., always 75-80)
- [ ] Scores don't change between videos
- [ ] Python terminal shows no MediaPipe logs

---

## 🐛 Quick Fixes

### "Failed to fetch" error

Python backend not running:
```bash
cd clarity-coach-cv/clarity-coach-cv/backend-python
python run_server.py
```

### Scores don't change

Frontend not rebuilt:
```bash
cd clarity-coach-frontend/frontend
npm run build
cd ..
# Restart Node.js backend
node server.js
```

### "CORS error" in console

Check Python backend `app/config.py`:
```python
cors_origins: list[str] = [
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]
```

---

## 📊 What's Being Measured

### Eye Contact (MediaPipe Iris Tracking)
- Detects iris position in each frame
- Compares to face center
- Score = % of frames looking at camera

### Posture (MediaPipe Pose Landmarks)
- Measures shoulder-to-hip distance
- Longer torso = more upright
- Normalized across all frames

### Gestures (MediaPipe Hand Tracking)
- Tracks wrist motion between frames
- Optimal = moderate movement
- Too little or too much reduces score

---

## 🎓 Next Steps

Once verified working:

1. **Read:** INTEGRATION_GUIDE.md (full architecture)
2. **Read:** MEDIAPIPE_INTEGRATION_SUMMARY.md (how it works)
3. **Regenerate API keys** (current ones are exposed)
4. **Optimize:** Tune video resolution if processing too slow

---

**Total Time:** 5 minutes to verify real body language analysis! ⚡
