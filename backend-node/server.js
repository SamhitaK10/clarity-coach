const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
console.log("Anthropic key loaded:", !!process.env.ANTHROPIC_API_KEY);
console.log("OpenAI key loaded:", !!process.env.OPENAI_API_KEY);
const express = require('express');
const cors = require('cors');

const transcribeRouter = require('./routes/transcribe');
const analyzeRouter = require('./routes/analyze');
const voiceFeedbackRouter = require('./routes/voice-feedback');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/transcribe', transcribeRouter);
app.use('/api/analyze', analyzeRouter);
app.use('/api/voice-feedback', voiceFeedbackRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Interview coaching API is running' });
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
