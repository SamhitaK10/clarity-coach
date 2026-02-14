# 🎯 Clarity Coach

AI-powered workplace communication assistant that analyzes short video presentations to provide nonverbal feedback on eye contact, posture, and gesture activity.

## Overview

Clarity Coach helps professionals improve their workplace communication by analyzing 30-60 second videos and providing concrete, actionable coaching on nonverbal communication patterns.

**Key Features:**
- 🎥 Automated video analysis using MediaPipe Holistic with iris tracking
- 📊 Three key metrics: Eye Contact, Posture, and Gestures (0-100 scores)
- 🤖 AI-powered coaching feedback using OpenAI GPT-4o-mini
- ⚡ Local CPU processing (30-60 seconds) or optional Modal GPU (faster)
- 🌐 Clean web interface for easy use
- 🔧 Test scripts for debugging and validation

## Architecture

```
┌─────────────┐
│  Frontend   │  Static HTML/CSS/JS
│  (Browser)  │
└──────┬──────┘
       │ POST /analyze
       ▼
┌─────────────┐
│   FastAPI   │  Backend API
│   Backend   │
└──────┬──────┘
       │
       ├─────► Local MediaPipe ──► Holistic + Iris ──► Metrics
       │        (CPU, runs anywhere)
       │
       └─────► OpenAI GPT-4o-mini ──► Coaching Feedback
```

**Optional Modal GPU acceleration available** for faster processing in `modal_functions/`.

### Components

1. **Frontend** (`frontend/`): Simple HTML/CSS/JS interface for video upload and results
2. **Backend** (`backend/app/`): FastAPI server with local MediaPipe processing
3. **LLM Integration**: OpenAI GPT-4o-mini for generating coaching feedback
4. **Test Scripts**: Local testing and debugging tools
5. **Modal Functions** (optional): GPU-accelerated processing for production

## Prerequisites

- **Python 3.9+**
- **OpenAI API key**: [platform.openai.com](https://platform.openai.com)
- **Optional**: Modal account for GPU acceleration: [modal.com](https://modal.com)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/clarity-coach.git
cd clarity-coach
```

### 2. Install Dependencies

Install all required dependencies (includes MediaPipe, OpenCV, FastAPI):

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create a `.env` file in the project root with your OpenAI API key:

```bash
# Create .env file
echo "OPENAI_API_KEY=sk-proj-YOUR_ACTUAL_KEY_HERE" > .env
echo "LLM_PROVIDER=openai" >> .env
echo "LLM_MODEL=gpt-4o-mini" >> .env
```

Or manually create `.env`:

```env
# OpenAI API (REQUIRED)
# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-proj-YOUR_ACTUAL_KEY_HERE

# LLM Configuration
LLM_PROVIDER=openai
LLM_MODEL=gpt-4o-mini

# Backend Configuration (Optional - defaults shown)
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
MAX_VIDEO_SIZE_MB=50
MAX_VIDEO_DURATION_SECONDS=90
```

### 4. Test Locally (Optional but Recommended)

Test video processing with a sample video:

```bash
# Add a test video to videos/ folder
python test_video_local.py
```

This validates MediaPipe is working correctly.

## Usage

### Start the Backend Server

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The server will start with auto-reload enabled (changes to code auto-refresh).

### Access the Web Interface

Open your browser and navigate to:

```
http://localhost:8000
```

### Using the Application

1. **Upload Video**: Click the upload area or drag & drop a video file (MP4, AVI, MOV, WEBM)
2. **Analyze**: Click "Analyze Video" and wait 30-60 seconds (local CPU processing)
3. **Review Results**: View your metrics and AI coaching feedback
4. **Iterate**: Upload another video to track improvement

### Testing & Debugging

**Test local processing:**
```bash
python test_video_local.py
```

**Debug landmark detection:**
```bash
python debug_landmarks.py
```

These scripts help validate MediaPipe is detecting face, pose, and hands correctly.

### API Usage

You can also use the API directly:

```bash
curl -X POST http://localhost:8000/analyze \
  -F "file=@your_video.mp4"
```

**Response:**

```json
{
  "metrics": {
    "eye_contact_score": 75.0,
    "posture_score": 82.0,
    "gesture_score": 65.0
  },
  "feedback": "• Your eye contact is strong...\n• Excellent posture...\n• Consider using more hand gestures...",
  "frame_count": 900
}
```

## Project Structure

```
clarity-coach/
├── backend/
│   ├── app/
│   │   ├── main.py                      # FastAPI entry point
│   │   ├── config.py                    # Configuration management
│   │   ├── routes/
│   │   │   └── analyze.py               # /analyze endpoint
│   │   ├── services/
│   │   │   ├── modal_client_local.py    # Local MediaPipe processing
│   │   │   ├── modal_client.py          # Modal GPU client (optional)
│   │   │   └── llm_client.py            # OpenAI/Anthropic client
│   │   └── models/
│   │       └── schemas.py               # Pydantic models
│   └── tests/
├── modal_functions/
│   ├── mediapipe_processor.py           # Modal GPU function (optional)
│   ├── utils.py                         # Metric calculations
│   └── requirements.txt
├── frontend/
│   ├── index.html                       # Web interface
│   ├── style.css                        # Styling
│   └── app.js                           # Frontend logic
├── test_video_local.py                  # Local video testing script
├── debug_landmarks.py                   # Landmark detection debugger
├── requirements.txt                     # Unified dependencies
├── .gitignore
├── CLAUDE.md                            # Project instructions
└── README.md
```

## Metrics Explained

### Eye Contact Score (0-100)

Measures the percentage of frames where the speaker appears to be looking at the camera. Uses MediaPipe iris landmarks (indices 468-477) to estimate gaze direction.

**Technical Note**: Requires `refine_face_landmarks=True` in MediaPipe Holistic to enable iris tracking (478 landmarks instead of 468).

- **90-100**: Excellent, consistent eye contact
- **70-89**: Good eye contact with occasional breaks
- **40-69**: Moderate, could be improved
- **0-39**: Limited eye contact, needs attention
- **0**: No face detected or iris tracking disabled

### Posture Score (0-100)

Evaluates upright posture based on shoulder-to-hip distance (torso length). Longer torso indicates upright posture, shorter suggests slouching.

- **90-100**: Excellent upright posture
- **70-89**: Good posture
- **40-69**: Somewhat slouched
- **0-39**: Poor posture, significantly slouched

### Gesture Score (0-100)

Measures hand movement activity by tracking wrist displacement between frames. Moderate gesturing scores highest, as both too little and too much can be distracting.

- **90-100**: Optimal natural gesturing
- **70-89**: Good gesture activity
- **40-69**: Either too few or too many gestures
- **0-39**: Very limited or excessive gesturing
- **0**: No hands detected in video (hands out of frame)

## Testing the Modal Function

You can test the Modal function independently:

```bash
# Create a test video or use an existing one
modal run modal_functions/mediapipe_processor.py --video-path path/to/test_video.mp4
```

This will process the video and display metrics without needing the full backend.

## Development

### Running Tests

```bash
cd backend
pytest tests/
```

### API Documentation

With the server running, visit:

```
http://localhost:8000/docs
```

For interactive API documentation (Swagger UI).

### Modifying Metrics

To adjust metric calculations, edit:

- `modal_functions/utils.py`: Raw feature extraction and score conversion
- Adjust thresholds in `convert_to_scores()` function

### Customizing LLM Prompts

To modify coaching feedback style, edit:

- `backend/app/services/llm_client.py`: Update `_create_coaching_prompt()` method

## Deployment

### Production Considerations

1. **Environment Variables**: Use secure secret management (not .env files)
2. **Rate Limiting**: Add rate limiting to prevent abuse
3. **Video Storage**: Currently videos are processed in-memory and not stored
4. **CORS**: Update `cors_origins` in config for your production domain
5. **HTTPS**: Use a reverse proxy (nginx, Caddy) with SSL certificates
6. **Monitoring**: Add logging and error tracking (Sentry, etc.)

### Deploying to Cloud

**Backend Options:**
- Render, Railway, Fly.io (easiest)
- AWS EC2, Google Cloud Run, Azure App Service
- Heroku

**Modal Function:**
Already deployed via `modal deploy` - automatically scales with usage.

## Troubleshooting

### Modal Authentication Issues

**Modal doesn't need API keys in `.env`!** Authentication is handled via the CLI:

```bash
# Authenticate Modal (only need to do this once)
modal token new

# Verify authentication
modal token list

# Check if function is deployed
modal app list
```

Your Modal credentials are stored in `~/.modal.toml` automatically.

### Modal Function Not Found

If you get "Modal function not found" error:

```bash
# Ensure you're authenticated
modal token new

# Redeploy the function
modal deploy modal_functions/mediapipe_processor.py

# Verify deployment
modal app list
```

### Video Processing Fails

- Check video format (MP4, AVI, MOV, WEBM only)
- Ensure video has a visible face and person
- Try with a shorter video (under 60 seconds)
- Check Modal logs: `modal app logs clarity-coach-mediapipe`

### LLM Generation Fails

- Verify API key is set correctly in `.env`
- Check API quota/credits
- The app will fall back to rule-based feedback if LLM fails

### CORS Issues

If accessing from a different origin, update `cors_origins` in `.env`:

```env
CORS_ORIGINS=["http://localhost:3000", "https://yourdomain.com"]
```

## Limitations & Future Work

**Current Limitations:**
- Only analyzes nonverbal communication (not speech content)
- Requires visible face and body in video
- Single-person videos only
- Cultural bias in nonverbal norms (Western-centric)

**Planned Features:**
- Speech analysis (filler words, pace, volume)
- Sentiment and tone analysis
- Multi-language support
- Historical tracking and progress reports
- Custom coaching profiles for different contexts

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Built with [MediaPipe](https://mediapipe.dev/) by Google
- Powered by [Modal](https://modal.com) GPU infrastructure
- LLM by [OpenAI](https://openai.com)

## Support

For issues or questions:
- Open an issue on GitHub
- Check existing issues for solutions

---
