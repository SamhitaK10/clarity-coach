# Conversational Voice Agent - Design Document

## 🎯 Overview

The Conversational Voice Agent enables users to have natural, two-way voice conversations with an AI coach after completing their practice session. The agent provides personalized feedback, answers questions, and offers coaching advice based on the user's performance analysis.

---

## 🏗️ Architecture

### High-Level Flow

```
User Speech
    ↓
Browser MediaRecorder (Audio Capture)
    ↓
Frontend (React Component)
    ↓
Audio Blob → POST /api/transcribe
    ↓
OpenAI Whisper API (Speech-to-Text)
    ↓
Transcript → POST /api/conversation
    ↓
OpenAI GPT-4o (Conversational AI)
    ↓
AI Response Text → POST /api/voice-feedback
    ↓
ElevenLabs API (Text-to-Speech)
    ↓
Base64 Audio → Frontend
    ↓
Browser Audio Playback
```

---

## 🧩 Components

### 1. Frontend Component
**File:** `frontend/src/app/components/conversation/ConversationModal.tsx`

**Responsibilities:**
- Manage conversation UI state
- Record user audio input
- Send audio for transcription
- Display conversation history
- Play AI voice responses
- Handle errors and loading states

**Key State Variables:**
```typescript
const [isOpen, setIsOpen] = useState(false);
const [isRecording, setIsRecording] = useState(false);
const [isProcessing, setIsProcessing] = useState(false);
const [status, setStatus] = useState<'idle' | 'recording' | 'transcribing' | 'thinking' | 'speaking'>('idle');
const [messages, setMessages] = useState<Message[]>([]);
const [error, setError] = useState<string | null>(null);
```

**User Flow:**
1. User clicks "Talk to AI Coach" button on results page
2. Modal opens with conversation interface
3. User presses microphone button to start recording
4. User speaks their question
5. User releases button or clicks stop
6. System processes and AI responds with voice
7. Conversation continues naturally

---

### 2. Backend API Endpoints

#### POST /api/transcribe
**File:** `routes/transcribe.js`

**Purpose:** Converts user's speech to text

**Request:**
```
Content-Type: multipart/form-data
audio: [audio file blob]
```

**Response:**
```json
{
  "transcript": "How can I improve my eye contact?"
}
```

**Implementation:**
- Uses OpenAI Whisper API
- Supports multiple audio formats (webm, mp4, mp3)
- Validates file size (max 25MB)
- Returns transcribed text

---

#### POST /api/conversation
**File:** `routes/conversation.js`

**Purpose:** Generates AI coach response using GPT-4o

**Request:**
```json
{
  "message": "How can I improve my eye contact?",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Previous message..."
    },
    {
      "role": "assistant",
      "content": "Previous response..."
    }
  ],
  "analysisContext": {
    "overallScore": 78,
    "categoryScores": {
      "posture": 82,
      "eyeContact": 71,
      "clarity": 85,
      "pacing": 75
    },
    "transcript": "User's original speech...",
    "strongMoments": [...],
    "areasToImprove": [...]
  }
}
```

**Response:**
```json
{
  "response": "Great question! To improve eye contact, try practicing with a camera placed at eye level..."
}
```

**System Prompt:**
```
You are a supportive and encouraging speech coach helping users improve
their interview and presentation skills. You have just analyzed their practice
session and are now having a conversation with them about their performance.

Key guidelines:
- Be supportive and encouraging
- Reference specific metrics from their analysis
- Provide actionable, concrete advice
- Keep responses concise (2-4 sentences max) since this is a voice conversation
- Use a conversational, friendly tone
- Focus on improvement strategies
```

**Context Awareness:**
- Has access to full performance analysis
- Can reference specific scores and feedback
- Maintains conversation history
- Provides personalized advice

---

#### POST /api/voice-feedback
**File:** `routes/voice-feedback.js`

**Purpose:** Converts AI text response to speech

**Request:**
```json
{
  "text": "Great question! To improve eye contact..."
}
```

**Response:**
```json
{
  "audio": "base64_encoded_audio_data..."
}
```

**Implementation:**
- Uses ElevenLabs Text-to-Speech API
- Voice model: Default (natural, professional)
- Returns base64-encoded MP3 audio
- Optimized for conversational speech

---

## 🔄 Conversation Loop

### Complete Interaction Flow

```
1. User Action
   ├─ Press microphone button
   ├─ Speak question
   └─ Release/stop

2. Audio Capture
   ├─ MediaRecorder captures audio
   ├─ Create audio blob
   └─ Display "Transcribing..." status

3. Transcription
   ├─ POST audio to /api/transcribe
   ├─ OpenAI Whisper processes
   ├─ Receive transcript text
   └─ Add user message to conversation history

4. AI Response Generation
   ├─ POST to /api/conversation with:
   │   ├─ User's transcript
   │   ├─ Conversation history
   │   └─ Performance analysis context
   ├─ GPT-4o generates response
   └─ Add assistant message to history

5. Voice Synthesis
   ├─ POST AI response to /api/voice-feedback
   ├─ ElevenLabs generates speech
   ├─ Receive base64 audio
   └─ Display "Speaking..." status

6. Audio Playback
   ├─ Decode base64 to audio blob
   ├─ Create audio element
   ├─ Play through browser
   └─ Return to "idle" when complete

7. Ready for Next Turn
   └─ Repeat from step 1
```

---

## 💬 Message Structure

### Message Interface
```typescript
interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
  isPlaying?: boolean;
}
```

### Conversation History Format
```typescript
const messages: Message[] = [
  {
    role: 'user',
    content: 'How can I improve my pacing?',
    timestamp: 1707963400000
  },
  {
    role: 'assistant',
    content: 'Great question! Your pacing was at 75, which is solid. To improve further...',
    timestamp: 1707963405000
  }
];
```

---

## 🎨 UI States

### Status Indicators

1. **Idle**
   - Display: Microphone button (not pressed)
   - User can: Press to start recording
   - Visual: Default state, ready to record

2. **Recording**
   - Display: Red recording indicator, pulsing animation
   - User can: Speak, then release or click stop
   - Visual: Active microphone, waveform animation

3. **Transcribing**
   - Display: "Transcribing your question..."
   - User can: Wait
   - Visual: Loading spinner

4. **Thinking**
   - Display: "AI is thinking..."
   - User can: Wait
   - Visual: Loading spinner or thinking animation

5. **Speaking**
   - Display: "AI is speaking..." with audio waveform
   - User can: Listen, optionally stop playback
   - Visual: Animated waveform matching audio

6. **Error**
   - Display: Error message
   - User can: Retry or dismiss
   - Visual: Error icon and message

---

## 🎤 Audio Recording

### Browser MediaRecorder API

```typescript
const startRecording = async () => {
  // Request microphone permission
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      sampleRate: 44100
    }
  });

  // Create MediaRecorder
  const mimeType = MediaRecorder.isTypeSupported('audio/webm')
    ? 'audio/webm'
    : 'audio/mp4';

  const recorder = new MediaRecorder(stream, { mimeType });

  // Collect audio chunks
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => chunks.push(e.data);

  // Create blob when stopped
  recorder.onstop = () => {
    const audioBlob = new Blob(chunks, { type: mimeType });
    processUserMessage(audioBlob);
  };

  recorder.start(100); // Collect data every 100ms
};
```

### Audio Playback

```typescript
const playAudio = (base64Audio: string) => {
  // Decode base64 to blob
  const audioData = atob(base64Audio);
  const arrayBuffer = new ArrayBuffer(audioData.length);
  const view = new Uint8Array(arrayBuffer);
  for (let i = 0; i < audioData.length; i++) {
    view[i] = audioData.charCodeAt(i);
  }
  const audioBlob = new Blob([arrayBuffer], { type: 'audio/mpeg' });

  // Create and play audio element
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);

  audio.onended = () => {
    setStatus('idle');
    URL.revokeObjectURL(audioUrl);
  };

  audio.play();
};
```

---

## 🧠 Context-Aware Coaching

### Analysis Context Structure

The AI coach has access to the user's complete performance analysis:

```typescript
interface AnalysisContext {
  overallScore: number;           // 0-100
  categoryScores: {
    posture: number;              // 0-100
    eyeContact: number;           // 0-100
    clarity: number;              // 0-100
    pacing: number;               // 0-100
  };
  transcript: string;             // User's original speech
  fillerWords: Array<{
    word: string;
    count: number;
    positions: number[];
  }>;
  strongMoments: string[];        // Positive highlights
  areasToImprove: string[];       // Improvement suggestions
  feedback: string;               // Overall coaching feedback
}
```

### Example Context-Aware Responses

**User:** "Why did I get a 71 on eye contact?"

**AI (with context):** "You scored 71 on eye contact because the analysis detected some moments where engagement indicators suggested you might have been looking away. This is common when we're thinking about what to say next. Try practicing while maintaining focus on a specific point, like the camera lens."

**User:** "What were my strong moments?"

**AI (with context):** "Your strongest moments were your clear articulation—you scored 85 on clarity—and your upright posture at 82. The analysis specifically noted: 'Excellent pronunciation throughout' and 'Maintained professional bearing.' These are great foundations to build on!"

---

## 🔒 Security & Privacy

### Data Handling

1. **Audio Data:**
   - Recorded in browser
   - Sent to backend for transcription
   - Not permanently stored
   - Deleted after processing

2. **Conversation History:**
   - Maintained in browser session only
   - Not persisted to database
   - Lost when modal closes
   - No server-side conversation storage

3. **API Keys:**
   - Stored in .env file (server-side only)
   - Never exposed to frontend
   - Used only for backend API calls

### Rate Limiting Considerations

- No built-in rate limiting currently
- Consider adding limits for production:
  - Max conversation length (e.g., 20 turns)
  - Max recording duration (e.g., 30 seconds per turn)
  - API call throttling

---

## 💰 Cost Analysis

### Per Conversation Turn

1. **Transcription (OpenAI Whisper):**
   - Cost: ~$0.006 per minute of audio
   - Average turn: 5-10 seconds
   - Cost per turn: ~$0.001

2. **AI Response (GPT-4o):**
   - Input: ~500 tokens (context + history + user message)
   - Output: ~100 tokens (2-4 sentence response)
   - Cost: ~$0.005 per turn

3. **Voice Synthesis (ElevenLabs):**
   - Cost: ~$0.30 per 1,000 characters
   - Average response: ~200 characters
   - Cost per turn: ~$0.06

**Total cost per turn:** ~$0.066

**10-turn conversation:** ~$0.66

---

## 🚀 Performance Optimizations

### Current Optimizations

1. **Concise Responses:**
   - System prompt limits AI to 2-4 sentences
   - Reduces TTS cost and latency
   - Improves conversational flow

2. **Audio Streaming:**
   - Audio plays immediately when received
   - No waiting for complete download

3. **Context Pruning:**
   - Only recent conversation history sent to GPT-4o
   - Reduces token usage and cost

### Potential Future Optimizations

1. **Response Caching:**
   - Cache common questions and responses
   - Reduce API calls for frequent queries

2. **Streaming Responses:**
   - Stream GPT-4o responses token-by-token
   - Begin TTS while still generating text
   - Reduce perceived latency

3. **WebSocket Connection:**
   - Maintain persistent connection
   - Reduce HTTP overhead
   - Enable real-time updates

---

## 🐛 Error Handling

### Error Types & Handling

1. **Microphone Access Denied:**
   ```typescript
   catch (err) {
     if (err.name === 'NotAllowedError') {
       setError('Microphone access denied. Please allow microphone access.');
     }
   }
   ```

2. **Transcription Failed:**
   ```typescript
   if (!transcribeResponse.ok) {
     setError('Failed to transcribe audio. Please try again.');
     // Allow user to retry
   }
   ```

3. **AI Response Failed:**
   ```typescript
   if (!conversationResponse.ok) {
     setError('AI coach is temporarily unavailable. Please try again.');
     // Conversation history preserved for retry
   }
   ```

4. **Audio Playback Failed:**
   ```typescript
   audio.onerror = () => {
     setError('Failed to play audio response.');
     // Offer text-only fallback
   }
   ```

### Graceful Degradation

- If voice synthesis fails, show text response
- If transcription fails, offer text input option
- Preserve conversation history across errors
- Allow easy retry without losing context

---

## 🧪 Testing Guidelines

### Manual Testing Checklist

- [ ] Microphone permission request works
- [ ] Recording starts and stops correctly
- [ ] Audio transcription is accurate
- [ ] AI responses are contextually relevant
- [ ] Voice playback works smoothly
- [ ] Conversation history displays correctly
- [ ] Error messages are clear and helpful
- [ ] Modal closes without issues
- [ ] Works on different browsers (Chrome, Firefox, Edge)
- [ ] Works on mobile devices

### Example Test Conversations

**Test 1: General Question**
- User: "How did I do overall?"
- Expected: AI references overall score and provides summary

**Test 2: Specific Category**
- User: "What can I do to improve my clarity?"
- Expected: AI references clarity score and gives specific advice

**Test 3: Follow-up Question**
- User: "Can you give me an example?"
- Expected: AI provides concrete example based on context

---

## 📊 Analytics & Metrics

### Trackable Metrics (Future Enhancement)

1. **Usage Metrics:**
   - Number of conversations started
   - Average conversation length (turns)
   - Average turn duration

2. **Quality Metrics:**
   - User satisfaction ratings
   - Conversation completion rate
   - Retry/error rates

3. **Cost Metrics:**
   - API costs per conversation
   - Average cost per user
   - Cost breakdown by service

---

## 🔄 Future Enhancements

### Planned Features

1. **Conversation Memory:**
   - Save conversation history
   - Resume previous conversations
   - Track progress over time

2. **Multi-modal Input:**
   - Text input option
   - Mix of voice and text
   - Upload audio files

3. **Advanced Voice Options:**
   - Multiple voice personas
   - Adjustable speaking speed
   - Different coaching styles

4. **Smart Suggestions:**
   - Suggested questions based on analysis
   - Quick reply buttons
   - Topic navigation

5. **Export & Sharing:**
   - Export conversation transcript
   - Share coaching insights
   - Generate coaching reports

---

## 📝 Code Structure

### Component Organization

```
frontend/src/app/components/conversation/
├── ConversationModal.tsx          # Main modal component
└── (future)
    ├── MessageBubble.tsx          # Individual message UI
    ├── RecordingButton.tsx        # Microphone button
    └── AudioVisualizer.tsx        # Waveform animation
```

### API Routes

```
routes/
├── transcribe.js                  # OpenAI Whisper
├── conversation.js                # GPT-4o conversation
└── voice-feedback.js              # ElevenLabs TTS
```

---

## 🎯 Design Principles

1. **Conversational & Natural:**
   - Short, concise AI responses
   - Natural back-and-forth flow
   - Supportive, encouraging tone

2. **Context-Aware:**
   - References user's specific scores
   - Provides personalized advice
   - Maintains conversation history

3. **User-Friendly:**
   - Simple push-to-talk interface
   - Clear status indicators
   - Graceful error handling

4. **Performance-Focused:**
   - Fast response times
   - Minimal latency
   - Optimized API usage

5. **Privacy-Conscious:**
   - No persistent storage
   - Temporary audio processing
   - Clear data handling

---

## 🔗 Integration Points

### Results Page Integration

```typescript
// results-page.tsx
import { ConversationModal } from '../components/conversation/ConversationModal';

<ConversationModal
  isOpen={isConversationOpen}
  onClose={() => setIsConversationOpen(false)}
  analysisResults={results}
/>
```

### API Service Integration

```typescript
// services/api.ts
export async function sendConversationMessage(params: {
  message: string;
  conversationHistory: Message[];
  analysisContext: AnalysisResponse;
}): Promise<ConversationResponse>
```

---

## 📖 Summary

The Conversational Voice Agent provides a natural, interactive way for users to engage with AI coaching after their practice sessions. By combining speech recognition, conversational AI, and text-to-speech, it creates a seamless voice experience that feels like talking to a real coach.

**Key Benefits:**
- ✅ Natural voice interaction
- ✅ Context-aware coaching
- ✅ Immediate, personalized feedback
- ✅ Conversational learning experience
- ✅ Hands-free operation

**Technology Stack:**
- OpenAI Whisper (Speech-to-Text)
- OpenAI GPT-4o (Conversational AI)
- ElevenLabs (Text-to-Speech)
- React + TypeScript (Frontend)
- Express + Node.js (Backend)

---

**Version:** 1.0.0
**Last Updated:** February 2026
**Status:** ✅ Production Ready
