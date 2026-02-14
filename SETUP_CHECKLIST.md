# Setup Checklist

Follow these steps in order to get Clarity Coach running.

## Prerequisites

- [ ] Python 3.9 or higher installed
- [ ] Internet connection

## Step-by-Step Setup

### 1. Modal Setup (Cloud GPU Platform)

```bash
# Install Modal CLI
pip install modal

# Authenticate with Modal (opens browser)
modal token new
```

✅ **What this does**: Creates and stores Modal credentials in `~/.modal.toml`
⚠️ **Important**: You do NOT need to add Modal credentials to `.env`

---

### 2. OpenAI API Setup

- [ ] Go to https://platform.openai.com/api-keys
- [ ] Sign in or create account
- [ ] Click "Create new secret key"
- [ ] Name it "clarity-coach"
- [ ] Copy the key (starts with `sk-proj-...`)

---

### 3. Configure Environment

- [ ] Open `.env` file in project root
- [ ] Replace `sk-proj-YOUR_OPENAI_KEY_HERE` with your actual key
- [ ] Save the file

Your `.env` should look like:
```env
OPENAI_API_KEY=sk-proj-abc123xyz...
LLM_PROVIDER=openai
LLM_MODEL=gpt-4o-mini
```

---

### 4. Install Dependencies

```bash
# Install backend dependencies
pip install -r backend/requirements.txt
```

---

### 5. Deploy Modal Function

```bash
# Deploy the video processing function to Modal's GPU cloud
modal deploy modal_functions/mediapipe_processor.py
```

⏳ This takes ~30 seconds. Wait for "Deployed!" message.

Verify deployment:
```bash
modal app list
```

You should see `clarity-coach-mediapipe` in the list.

---

### 6. Start Backend Server

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
# 1. Check Modal authentication
modal token list
# ✅ Should show your token

# 2. Check Modal deployment
modal app list
# ✅ Should show "clarity-coach-mediapipe"

# 3. Check .env is loaded
python -c "from backend.app.config import settings; print('OpenAI key configured:', bool(settings.openai_api_key))"
# ✅ Should print "True"

# 4. Check backend is running
curl http://localhost:8000/health
# ✅ Should return JSON with "status": "healthy"
```

---

## Common Issues

### ❌ "Modal function not found"

**Solution**:
```bash
modal token new  # Re-authenticate
modal deploy modal_functions/mediapipe_processor.py  # Re-deploy
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

❌ Don't try to add Modal credentials to `.env` - they're managed by Modal CLI
❌ Don't skip the `modal deploy` step - the backend needs this function
❌ Don't forget to save your OpenAI API key after pasting it into `.env`

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
