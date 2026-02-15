# Merge Plan: Main Branch (Voice) + CV Branch (Video)

## Overview

Two completely different implementations of coaching systems exist:

### Main Branch (Voice/Interview Coaching)
- **Technology**: Node.js + Express
- **Focus**: Audio interview coaching
- **Features**:
  - Audio transcription (OpenAI Whisper)
  - Text analysis & coaching (Claude/Anthropic)
  - Voice synthesis (ElevenLabs)
  - Interview-specific feedback (clarity, grammar, phrasing, filler words)
- **Target**: Non-native English speakers practicing interviews

### CV Branch (Video/Nonverbal Coaching)
- **Technology**: Python + FastAPI
- **Focus**: Video nonverbal communication
- **Features**:
  - Video processing (MediaPipe Holistic)
  - Nonverbal metrics (eye contact, posture, gestures)
  - AI coaching (OpenAI GPT-4o-mini)
  - Iris tracking for eye contact
- **Target**: Workplace communication (presentations, pitches)

---

## Merge Strategy

### Option 1: Unified Full-Stack Coaching Platform (RECOMMENDED)

Combine both systems into one comprehensive coaching platform.

**Architecture**:
```
clarity-coach/
├── backend-node/          # Voice/interview coaching (keep from main)
│   ├── routes/
│   │   ├── transcribe.js
│   │   ├── analyze.js
│   │   └── voice-feedback.js
│   ├── server.js
│   └── package.json
├── backend-python/        # Video/nonverbal coaching (keep from cv)
│   ├── app/
│   │   ├── main.py
│   │   ├── routes/analyze.py
│   │   └── services/
│   └── requirements.txt
├── frontend/              # Unified web interface (NEW - to build)
│   ├── index.html        # Main dashboard
│   ├── interview.html    # Interview coaching UI
│   ├── presentation.html # Video coaching UI
│   └── app.js
├── modal_functions/      # Keep from cv
└── shared/              # Shared utilities
```

**What to Keep**:
- ✅ ALL Node.js backend code (audio/interview coaching)
- ✅ ALL Python backend code (video/nonverbal coaching)
- ✅ Modal functions for video processing
- ✅ Test scripts (test_video_local.py, debug_landmarks.py)
- ✅ Both .env configurations (merge keys)

**What to Create**:
- 🆕 Unified frontend with mode selection
- 🆕 Nginx/proxy to route requests to both backends
- 🆕 Unified documentation explaining both modes

**Ports**:
- Node.js backend: Port 3000
- Python backend: Port 8000
- Frontend: Port 80 (or 5000)

---

### Option 2: Keep Separate (Simpler, Less Integrated)

Keep both as independent projects in separate branches.

**Branches**:
- `main` → Interview coaching (voice)
- `cv` → Presentation coaching (video)

**What to Do**:
- ⚠️ Keep separate branches
- ⚠️ No code merging needed
- ⚠️ Maintain two different READMEs
- ⚠️ Deploy as separate apps

---

### Option 3: Choose One Primary Focus

Pick one system as primary, archive the other.

**If choosing video (cv)**:
- Keep all cv branch code
- Optionally add voice synthesis from main for feedback delivery
- Archive audio transcription features

**If choosing audio (main)**:
- Keep all main branch code
- Optionally add video analysis as separate feature
- Requires rewriting video processing in Node.js OR adding Python microservice

---

## Recommended Approach: Option 1 (Unified Platform)

### Phase 1: Prepare Structure
1. Create separate backend directories
2. Rename `backend/` to `backend-python/`
3. Move Node.js files to `backend-node/`
4. Update import paths and configurations

### Phase 2: Merge .env Files
```env
# OpenAI (used by both)
OPENAI_API_KEY=sk-proj-xxx

# Anthropic (used by Node.js for interview coaching)
ANTHROPIC_API_KEY=sk-ant-xxx

# ElevenLabs (voice synthesis for interview coaching)
ELEVENLABS_API_KEY=sk-xxx

# Python backend
LLM_PROVIDER=openai
LLM_MODEL=gpt-4o-mini
BACKEND_PORT=8000

# Node.js backend
PORT=3000
```

### Phase 3: Create Unified Frontend
- Landing page with two options:
  - "Interview Coaching" → Audio transcription + voice feedback
  - "Presentation Coaching" → Video analysis + nonverbal metrics
- Route to appropriate backend based on selection

### Phase 4: Documentation
- Update README with both features
- Separate setup instructions for each backend
- Explain when to use which mode

### Phase 5: Testing
- Test interview coaching flow
- Test video coaching flow
- Test end-to-end for both

---

## File-by-File Merge Decisions

### Keep from MAIN (Voice):
- ✅ `server.js`
- ✅ `routes/transcribe.js`
- ✅ `routes/analyze.js`
- ✅ `routes/voice-feedback.js`
- ✅ `package.json`
- ✅ `package-lock.json`
- ✅ `test.html`

### Keep from CV (Video):
- ✅ `backend/app/` (entire directory)
- ✅ `frontend/` (entire directory - can be enhanced)
- ✅ `modal_functions/`
- ✅ `test_video_local.py`
- ✅ `debug_landmarks.py`
- ✅ `requirements.txt`

### Merge/Combine:
- 🔄 `.gitignore` → Merge both (Node.js + Python ignores)
- 🔄 `README.md` → Rewrite to explain both systems
- 🔄 `.env.example` → Combine all API keys
- 🔄 `.env` → Manually merge (don't commit!)

### Discard:
- ❌ Duplicate/conflicting files (choose one based on context)

---

## Deployment Strategy

### Development:
```bash
# Terminal 1: Node.js backend
cd backend-node
npm install
npm start  # Port 3000

# Terminal 2: Python backend
cd backend-python
uvicorn app.main:app --reload --port 8000

# Terminal 3: Frontend (if separate)
python -m http.server 5000
```

### Production:
- Deploy Node.js backend to Vercel/Railway/Render
- Deploy Python backend to Fly.io/Railway/Render
- Deploy frontend to Vercel/Netlify
- Use CORS to connect frontends to backends

---

## Timeline Estimate

**Option 1 (Unified)**:
- Phase 1-2: 2-3 hours (restructure + merge configs)
- Phase 3: 4-6 hours (unified frontend)
- Phase 4: 1-2 hours (documentation)
- Phase 5: 2-3 hours (testing)
- **Total**: 1-2 days

**Option 2 (Separate)**:
- 30 minutes (just document branches)

**Option 3 (Choose One)**:
- 1-2 hours (cleanup + optional features)

---

## Risks & Considerations

**Option 1**:
- ⚠️ Two backends to maintain
- ⚠️ More complex deployment
- ⚠️ Higher hosting costs
- ✅ Most feature-complete
- ✅ Better user experience

**Option 2**:
- ✅ Simple to maintain
- ✅ Easy deployment
- ⚠️ Users need to know which branch to use
- ⚠️ Features not integrated

**Option 3**:
- ✅ Single focus
- ✅ Simpler codebase
- ⚠️ Lose valuable features from other branch

---

## Recommendation

**Go with Option 1 (Unified Platform)** because:
1. Both systems are valuable and complementary
2. Interview coaching + presentation coaching = complete solution
3. Can market as comprehensive communication coaching platform
4. Backends can run independently (microservices)
5. Users get best of both worlds

**Next Steps**:
1. Decide on merge approach
2. I can implement the merge if you approve Option 1
3. Create unified frontend
4. Update documentation
5. Test both systems end-to-end

**What would you like to do?**
