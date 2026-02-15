# Conversational AI Coach Feature

## Overview

The application now includes a **full voice conversation feature** where you can talk with an AI coach after viewing your results. It's like having a real conversation with a speech coach - you speak, the AI listens, responds in text, and speaks back to you using a natural voice.

## How It Works

### User Flow

1. **Complete a practice session** and view your results
2. **Click "Talk to AI Coach"** button on the results page
3. **Conversation modal opens** with a greeting from the AI
4. **Press the microphone button** to start recording your question/message
5. **Speak naturally** - ask about your performance, request tips, etc.
6. **Release/stop** when done speaking
7. **AI processes your speech:**
   - Transcribes your speech to text (OpenAI Whisper)
   - Understands your message (OpenAI GPT-4o)
   - Generates a helpful response
   - Converts response to natural speech (ElevenLabs)
   - Speaks the response to you
8. **Continue the conversation** - ask follow-up questions, get clarifications
9. **Close** when finished

### Visual States

The modal shows different states:
- **Idle**: "Press mic to speak"
- **Recording**: Red pulsing mic button, "Listening..."
- **Transcribing**: Loading spinner, "Understanding..."
- **Thinking**: Loading spinner, "AI is thinking..."
- **Speaking**: Pulsing volume icon, "AI is speaking..."

---

## Technical Implementation

### Backend Components

#### 1. Conversation API (`routes/conversation.js`)
- **Endpoint**: `POST /api/conversation`
- **Model**: OpenAI GPT-4o
- **Purpose**: Handles conversational messages with context awareness

**Request Format:**
```json
{
  "message": "How can I improve my pacing?",
  "conversationHistory": [
    {"role": "user", "content": "..."},
    {"role": "assistant", "content": "..."}
  ],
  "analysisContext": {
    "overallScore": 78,
    "summary": "...",
    "categoryScores": [...]
  }
}
```

**Response Format:**
```json
{
  "response": "To improve your pacing, try...",
  "conversationHistory": [...]
}
```

**Features:**
- Maintains conversation history for context
- Uses analysis results to give relevant feedback
- Generates natural, conversational responses (2-4 sentences)
- Supportive and encouraging tone

#### 2. Transcription (`/api/transcribe`)
- Converts spoken audio to text
- Used for each user message in conversation

#### 3. Voice Feedback (`/api/voice-feedback`)
- Converts AI text responses to natural speech
- Uses ElevenLabs text-to-speech
- Returns base64-encoded MP3 audio

### Frontend Components

#### ConversationModal Component
**Location**: `frontend/src/app/components/conversation/ConversationModal.tsx`

**Features:**
- Full voice conversation interface
- Audio recording with MediaRecorder API
- Message history display (user and AI messages)
- Audio playback for AI responses
- Real-time status indicators
- Error handling and recovery
- Automatic greeting on open
- Context-aware AI (knows your performance scores)

**Key Functions:**
- `startRecording()` - Captures user's voice
- `stopRecording()` - Processes recorded audio
- `processUserMessage()` - Full pipeline: transcribe → converse → speak
- `speakMessage()` - Plays AI response as audio

---

## API Endpoints

### POST `/api/conversation`
Send a message in conversation and get AI response.

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "message": "string (required)",
  "conversationHistory": "array (optional)",
  "analysisContext": "object (optional)"
}
```

**Response:**
```json
{
  "response": "string",
  "conversationHistory": [
    {"role": "user", "content": "..."},
    {"role": "assistant", "content": "..."}
  ]
}
```

---

## Usage Examples

### Example Conversation

**User**: "How did I do overall?"

**AI Coach**: "You did really well! Your overall score was 78 out of 100, which shows strong fundamentals. Your clarity was particularly impressive at 85, meaning you articulated your words very clearly. Where would you like to focus on improving?"

**User**: "What about my pacing?"

**AI Coach**: "Your pacing scored 75, which is pretty good. You spoke at about 145 words per minute, which is in the optimal range. However, I noticed you accelerated a bit when discussing your achievements. Try slowing down during important points to let them sink in."

**User**: "Can you give me a specific tip?"

**AI Coach**: "Absolutely! Before mentioning an achievement, take a deliberate breath and pause for a full second. This creates anticipation and makes your accomplishment sound more significant. Practice this with your '40% user engagement' point."

---

## Configuration

### AI Model Settings

**Conversation Model** (OpenAI GPT-4o):
- Temperature: 0.8 (balanced creativity)
- Max tokens: 200 (concise responses for voice)
- System prompt emphasizes: supportive, conversational, brief

**Voice Model** (ElevenLabs):
- Voice ID: `EXAVITQu4vr4xnSDxMaL`
- Model: `eleven_multilingual_v2`
- Natural-sounding English voice

### Audio Settings

**Recording:**
- Echo cancellation: Enabled
- Noise suppression: Enabled
- Sample rate: 44100 Hz
- Format: webm (fallback to mp4)

**Playback:**
- Format: MP3 (base64-encoded)
- Auto-play: Yes
- Auto-stop on modal close: Yes

---

## User Experience Tips

### For Best Results

**Speaking:**
- Speak clearly at normal volume
- Wait until "Listening..." appears before speaking
- Keep messages conversational (not essays)
- One question/thought per message

**Environment:**
- Use in a quiet space
- Use headphones to prevent echo
- Ensure stable internet connection
- Allow microphone permissions

**Conversation Style:**
- Ask specific questions about your performance
- Request tips or advice
- Ask for clarification
- Share concerns or challenges

---

## Error Handling

The modal handles several error scenarios gracefully:

### Microphone Errors
- **Permission Denied**: Shows clear error message
- **No Device Found**: Asks user to connect microphone
- **Recording Failed**: Allows retry

### API Errors
- **Transcription Failed**: Shows error, doesn't lose history
- **Conversation Failed**: Allows retry without restarting
- **Voice Generation Failed**: Shows text response only (silent fallback)

### Network Errors
- **Connection Lost**: Clear error message
- **Timeout**: Allows manual retry
- **Rate Limit**: Suggests waiting before retry

---

## Privacy & Security

- **Audio is NOT stored** - Deleted after transcription
- **Conversations are NOT saved** - Lost when modal closes
- **API keys are server-side** - Never exposed to frontend
- **No personal data collection** - Only current session data

---

## Limitations

- **No conversation persistence** - History lost on modal close
- **One speaker at a time** - Can't interrupt AI while speaking
- **English optimized** - Best results with English speakers
- **Internet required** - All processing is cloud-based
- **Audio only** - No video or screen sharing

---

## Future Enhancements

Potential improvements:
- Save conversation history across sessions
- Export conversation transcripts
- Multiple AI voice options
- Interrupt AI while speaking
- Video calling with virtual coach avatar
- Multi-language support
- Offline mode with local models
- Session sharing/export

---

## Testing the Feature

### Quick Test
1. Start the server: `node server.js`
2. Complete a recording session
3. View results page
4. Click "Talk to AI Coach"
5. Say: "How can I improve my performance?"
6. Wait for AI to respond
7. Continue conversation

### Test Checklist
- [ ] Modal opens and greets user
- [ ] Microphone permission requested
- [ ] Can record voice message
- [ ] Transcription works correctly
- [ ] AI responds relevantly to questions
- [ ] Voice playback works
- [ ] Can have multi-turn conversation
- [ ] Error messages are helpful
- [ ] Modal closes cleanly
- [ ] Works in Chrome, Edge, Firefox

---

## Troubleshooting

### "Microphone access denied"
→ Allow permissions in browser settings → Refresh page

### "Transcription failed"
→ Check OPENAI_API_KEY is valid → Check internet connection

### "Conversation failed"
→ Check backend is running → Check API keys → Check console logs

### AI responses don't make sense
→ Analysis context may be missing → Check results data passed to modal

### No audio playback
→ Check ELEVENLABS_API_KEY → Check browser audio settings → Check speaker volume

### High latency
→ Each turn takes 5-15 seconds (transcribe + AI + voice gen) → Normal for cloud AI

---

## Cost Considerations

Each conversation turn uses:
- **OpenAI Whisper**: ~$0.006 per minute of audio (~$0.01 per message)
- **OpenAI GPT-4o**: ~$0.015 per request (200 tokens)
- **ElevenLabs TTS**: ~$0.18 per 1000 characters (~$0.04 per response)

**Total per turn**: ~$0.065 (6.5 cents)

**10-message conversation**: ~$0.65

Consider implementing:
- Rate limiting per user
- Message length limits
- Daily usage caps
- Token usage monitoring

---

## Summary

The conversational AI feature provides a natural, voice-based interaction with an AI coach that:
- ✅ Understands your questions and context
- ✅ Provides relevant, personalized feedback
- ✅ Speaks responses naturally
- ✅ Maintains conversation flow
- ✅ Handles errors gracefully

This creates a more engaging, human-like coaching experience compared to static results.
