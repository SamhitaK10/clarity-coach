# Quick Start Guide

Get Clarity Coach running in 5 minutes.

## Prerequisites

- Python 3.9+
- Modal account (sign up at [modal.com](https://modal.com))
- OpenAI API key (get one at [platform.openai.com](https://platform.openai.com))

## Steps

### 1. Install Modal

```bash
pip install modal
modal token new
```

### 2. Install Dependencies

```bash
pip install -r backend/requirements.txt
```

### 3. Configure Environment

Create `.env` file in project root:

```env
# OpenAI API (REQUIRED)
# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-proj-YOUR_ACTUAL_KEY_HERE

LLM_PROVIDER=openai
LLM_MODEL=gpt-4o-mini
```

**Note**: Modal authentication was already handled in Step 1 with `modal token new`. You do NOT need Modal credentials in `.env`.

### 4. Deploy Modal Function

```bash
modal deploy modal_functions/mediapipe_processor.py
```

Wait for deployment to complete (~30 seconds).

### 5. Start Backend

```bash
cd backend
uvicorn app.main:app --reload
```

### 6. Open Browser

Navigate to: http://localhost:8000

## Test It

1. Upload a short video (30-60s) of yourself speaking
2. Click "Analyze Video"
3. Wait 15-40 seconds
4. View your metrics and coaching feedback

## Troubleshooting

**"Modal function not found"**
```bash
# First, ensure you're authenticated
modal token new

# Then deploy
modal deploy modal_functions/mediapipe_processor.py
```

**Important**: Modal credentials are NOT in `.env`! They're stored automatically in `~/.modal.toml` after running `modal token new`.

**"Invalid API key"**
- Check your `.env` file has the correct `OPENAI_API_KEY`
- Make sure it starts with `sk-proj-`
- Ensure `.env` is in the project root directory

**"Module not found"**
```bash
pip install -r backend/requirements.txt
```

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check out the API docs at http://localhost:8000/docs
- Customize metrics in `modal_functions/utils.py`
- Modify coaching prompts in `backend/app/services/llm_client.py`

## Support

Open an issue on GitHub if you encounter problems.
