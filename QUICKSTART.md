# Quick Start Guide

Get Clarity Coach running in 3 minutes.

## Prerequisites

- Python 3.9+
- OpenAI API key (get one at [platform.openai.com](https://platform.openai.com))

## Steps

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

This installs MediaPipe, OpenCV, FastAPI, and all dependencies.

### 2. Configure Environment

Create `.env` file in project root:

```env
# OpenAI API (REQUIRED)
# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-proj-YOUR_ACTUAL_KEY_HERE

LLM_PROVIDER=openai
LLM_MODEL=gpt-4o-mini
```

### 3. Test Locally (Optional)

Add a test video to `videos/` folder and run:

```bash
python test_video_local.py
```

This validates MediaPipe is working.

### 4. Start Backend

```bash
cd backend
uvicorn app.main:app --reload
```

### 5. Open Browser

Navigate to: http://localhost:8000

## Test It

1. Upload a short video (30-60s) of yourself speaking
2. Click "Analyze Video"
3. Wait 15-40 seconds
4. View your metrics and coaching feedback

## Troubleshooting

**"Eye contact score always 0"**
- MediaPipe needs `refine_face_landmarks=True` for iris tracking
- This is already set in the code, so it should work
- Run `python debug_landmarks.py` to verify iris detection

**"Invalid API key"**
- Check your `.env` file has the correct `OPENAI_API_KEY`
- Make sure it starts with `sk-proj-`
- Ensure `.env` is in the project root directory

**"Module not found"**
```bash
pip install -r requirements.txt
```

**"NumPy version conflict"**
```bash
pip install "numpy<2"
```

**Slow processing**
- Local CPU processing takes 30-60 seconds per video
- This is normal! GPU would be faster but requires Modal setup

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check out the API docs at http://localhost:8000/docs
- Customize metrics in `modal_functions/utils.py`
- Modify coaching prompts in `backend/app/services/llm_client.py`

## Support

Open an issue on GitHub if you encounter problems.
