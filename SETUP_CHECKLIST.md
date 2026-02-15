# Setup Checklist

Follow these steps in order to get Clarity Coach running.

## Prerequisites

- [ ] Python 3.9 or higher installed
- [ ] Internet connection for downloading dependencies

## Step-by-Step Setup

### 1. Install Dependencies

```bash
# Install all requirements (MediaPipe, OpenCV, FastAPI, etc.)
pip install -r requirements.txt
```

✅ **What this installs**: MediaPipe, OpenCV, FastAPI, OpenAI SDK, and all dependencies
⏱️ **Time**: ~2-3 minutes

---

### 2. OpenAI API Setup

- [ ] Go to https://platform.openai.com/api-keys
- [ ] Sign in or create account
- [ ] Click "Create new secret key"
- [ ] Name it "clarity-coach"
- [ ] Copy the key (starts with `sk-proj-...`)

---

### 3. Configure Environment

- [ ] Create `.env` file in project root
- [ ] Add your OpenAI API key
- [ ] Save the file

Create `.env` with:
```env
OPENAI_API_KEY=sk-proj-YOUR_ACTUAL_KEY_HERE
LLM_PROVIDER=openai
LLM_MODEL=gpt-4o-mini
```

---

### 4. Test Locally (Optional but Recommended)

```bash
# Add a test video to videos/ folder
python test_video_local.py
```

✅ **What this does**: Validates MediaPipe is detecting face, pose, and hands correctly
⏱️ **Time**: ~20-30 seconds

---

### 5. Start Backend Server

```bash
# From project root
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

---

### 7. Test the Application

- [ ] Open browser to http://localhost:8000
- [ ] You should see the Clarity Coach interface
- [ ] Upload a test video (30-60 seconds, MP4 format)
- [ ] Click "Analyze Video"
- [ ] Wait 15-40 seconds for processing
- [ ] View your metrics and coaching feedback

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
python -c "from backend.app.config import settings; print('OpenAI key configured:', bool(settings.openai_api_key))"
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
pip install -r backend/requirements.txt
```

---

### ❌ Backend won't start

**Solution**:
- Make sure port 8000 is not in use
- Check `.env` file exists in project root
- Try: `cd backend && uvicorn app.main:app --reload`

---

## What NOT to Do

❌ Don't skip testing locally first - validates your setup works
❌ Don't use NumPy 2.x - MediaPipe requires NumPy 1.x
❌ Don't forget to save your OpenAI API key after pasting it into `.env`
❌ Don't commit `.env` to git - it's already in .gitignore

---

## Next Steps After Setup

1. Test with your own videos
2. Review the coaching feedback quality
3. Adjust metrics if needed (see `modal_functions/utils.py`)
4. Customize LLM prompts (see `backend/app/services/llm_client.py`)
5. Deploy to production (see README.md deployment section)

---

## Need Help?

- Read the full [README.md](README.md)
- Check [QUICKSTART.md](QUICKSTART.md)
- Open an issue on GitHub
