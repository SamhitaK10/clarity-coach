# Setup Checklist

Follow these steps in order to get Clarity Coach running.

## Prerequisites

- [ ] Python 3.9 or higher installed
- [ ] Node.js 16 or higher installed (for audio coaching)
- [ ] Internet connection for downloading dependencies

## Step-by-Step Setup

### 1. Install Dependencies

```bash
# Install Python requirements (MediaPipe, OpenCV, FastAPI, etc.)
pip install -r requirements.txt

# Install Node.js requirements (for audio coaching)
cd backend-node
npm install
cd ..
```

✅ **What this installs**:
- Python: MediaPipe, OpenCV, FastAPI, OpenAI SDK, and dependencies
- Node.js: Express, OpenAI SDK, Anthropic SDK, and dependencies
⏱️ **Time**: ~3-5 minutes total

---

### 2. API Keys Setup

**OpenAI API (Required for both modes):**
- [ ] Go to https://platform.openai.com/api-keys
- [ ] Sign in or create account
- [ ] Click "Create new secret key"
- [ ] Copy the key (starts with `sk-proj-...`)

**Anthropic API (Required for Interview Coaching):**
- [ ] Go to https://console.anthropic.com
- [ ] Sign in or create account
- [ ] Generate API key
- [ ] Copy the key (starts with `sk-ant-...`)

---

### 3. Configure Environment

- [ ] Create `.env` file in project root
- [ ] Add your OpenAI API key
- [ ] Save the file

Create `.env` with:
```env
# OpenAI (used by both backends)
OPENAI_API_KEY=sk-proj-YOUR_ACTUAL_KEY_HERE

# Anthropic (for interview coaching)
ANTHROPIC_API_KEY=sk-ant-YOUR_ACTUAL_KEY_HERE

# Python backend config
LLM_PROVIDER=openai
LLM_MODEL=gpt-4o-mini
BACKEND_PORT=8000

# Node.js backend config
PORT=3000
```

---

### 4. Test Locally (Optional but Recommended)

```bash
# Test video processing with 6 metrics
python test_video_local.py
```

✅ **What this does**: Validates MediaPipe is detecting face, pose, hands, and calculating all 6 metrics
⏱️ **Time**: ~30-60 seconds (local CPU processing)

---

### 5. Start Both Backend Servers

Open **two terminal windows**:

**Terminal 1 - Python Backend (Video Coaching):**
```bash
cd backend-python
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Node.js Backend (Audio Coaching):**
```bash
cd backend-node
node server.js
```

You should see both servers running:
- Python backend on http://localhost:8000
- Node.js backend on http://localhost:3000

---

### 6. Test the Application

- [ ] Open browser to http://localhost:8000
- [ ] You should see the Clarity Coach landing page
- [ ] **Test Presentation Coaching:**
  - Click "Start Video Analysis"
  - Upload a test video (30-60 seconds, MP4 format)
  - Click "Analyze Video"
  - Wait 30-60 seconds for processing
  - View all 6 metrics and coaching feedback
- [ ] **Test Interview Coaching:**
  - Return to landing page
  - Click "Start Interview Practice"
  - Record or upload audio
  - Click "Get Feedback"
  - Review transcription and coaching

---

## Verification Commands

Check if everything is configured correctly:

```bash
# 1. Test local video processing
python test_video_local.py
# ✅ Should process video and show scores

# 2. Debug landmark detection
python debug_landmarks.py
# ✅ Should show face/pose/hand detection stats

# 3. Check .env is loaded
python -c "from backend-python.app.config import settings; print('OpenAI key configured:', bool(settings.openai_api_key))"
# ✅ Should print "True"

# 4. Check backend is running
curl http://localhost:8000/health
# ✅ Should return JSON with "status": "healthy"
```

---

## Common Issues

### ❌ "Eye contact score always 0"

**Solution**:
- Run `python debug_landmarks.py` to check iris detection
- Code should have `refine_face_landmarks=True` (already set)
- If iris landmarks show 0%, MediaPipe might need reinstall:
  ```bash
  pip install --force-reinstall mediapipe==0.10.18
  ```

### ❌ "NumPy version conflict"

**Solution**:
```bash
pip install "numpy<2"  # MediaPipe needs NumPy 1.x
```

---

### ❌ "Invalid OpenAI API key"

**Solution**:
- Open `.env` file
- Verify `OPENAI_API_KEY=sk-proj-...` has your actual key
- Make sure there are no extra spaces or quotes
- Restart the backend server

---

### ❌ "Module not found" errors

**Solution**:
```bash
# Python dependencies
pip install -r requirements.txt

# Node.js dependencies
cd backend-node && npm install
```

---

### ❌ Backend won't start

**Solution**:
- Make sure ports 8000 and 3000 are not in use
- Check `.env` file exists in project root
- Python backend: `cd backend-python && uvicorn app.main:app --reload`
- Node.js backend: `cd backend-node && node server.js`

---

## What NOT to Do

❌ Don't skip testing locally first - validates your setup works
❌ Don't use NumPy 2.x - MediaPipe requires NumPy 1.x
❌ Don't forget to save your OpenAI API key after pasting it into `.env`
❌ Don't commit `.env` to git - it's already in .gitignore

---

## Next Steps After Setup

1. Test with your own videos and audio recordings
2. Review the coaching feedback quality
3. Adjust metrics if needed:
   - Video metrics: `modal_functions/utils.py`
   - Prompts: `backend-python/app/services/llm_client.py` and `backend-node/routes/analyze.js`
4. Try Spanish language support (in presentation mode)
5. Deploy to production (see README.md deployment section)

---

## Need Help?

- Read the full [README.md](README.md)
- Check [QUICKSTART.md](QUICKSTART.md)
- Open an issue on GitHub
