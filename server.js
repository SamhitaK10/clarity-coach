require('dotenv').config();
console.log("=".repeat(50));
console.log("ENVIRONMENT VARIABLES LOADED:");
console.log("OPENAI_API_KEY loaded:", !!process.env.OPENAI_API_KEY);
console.log("ANTHROPIC_API_KEY loaded:", !!process.env.ANTHROPIC_API_KEY);
console.log("ELEVENLABS_API_KEY loaded:", !!process.env.ELEVENLABS_API_KEY);
console.log("=".repeat(50));
const express = require('express');
const cors = require('cors');
const path = require('path');

const transcribeRouter = require('./routes/transcribe');
const analyzeRouter = require('./routes/analyze');
const voiceFeedbackRouter = require('./routes/voice-feedback');
const conversationRouter = require('./routes/conversation');
const sessionRouter = require('./routes/session');
const openaiTestRouter = require('./routes/openai-test');
const testUploadRouter = require('./routes/test-upload');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from the frontend build directory
app.use(express.static(path.join(__dirname, 'frontend/dist')));

app.use('/api/test-upload', testUploadRouter);
app.use('/api/transcribe', transcribeRouter);
app.use('/api/analyze', analyzeRouter);
app.use('/api/voice-feedback', voiceFeedbackRouter);
app.use('/api/conversation', conversationRouter);
app.use('/api/session', sessionRouter);
app.use('/api/openai-test', openaiTestRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Interview coaching API is running' });
});

// Serve voice.html
app.get('/voice.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'voice.html'));
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
