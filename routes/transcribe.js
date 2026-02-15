const express = require('express');
const multer = require('multer');
const OpenAI = require('openai');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');

const router = express.Router();

// Validate API key on module load
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ WARNING: OPENAI_API_KEY not set in environment variables');
} else {
  console.log('✅ OpenAI API key loaded for transcription');
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/* ---------- upload setup ---------- */

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.webm';
    cb(null, unique + ext);
  },
});

const upload = multer({ storage });

/* ---------- main route ---------- */

router.post('/', upload.single('audio'), async (req, res) => {
  console.log('📥 Transcription request received');

  if (!req.file) {
    console.error('❌ No audio file uploaded');
    return res.status(400).json({ error: 'No audio file uploaded' });
  }

  const filePath = req.file.path;
  console.log('📁 File saved:', filePath);
  console.log('📊 File size:', req.file.size, 'bytes');
  console.log('📋 MIME type:', req.file.mimetype);
  console.log('📝 Original name:', req.file.originalname);

  try {
    // Check if OpenAI API key exists
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY not configured');
      return res.status(503).json({ error: 'Transcription not configured: OPENAI_API_KEY missing' });
    }

    // Validate file size (OpenAI has 25MB limit)
    if (req.file.size > 25 * 1024 * 1024) {
      console.error('❌ File too large:', req.file.size);
      return res.status(400).json({ error: 'Audio file too large (max 25MB)' });
    }

    // Validate file size (minimum)
    if (req.file.size < 1000) {
      console.error('❌ File too small:', req.file.size);
      return res.status(400).json({ error: 'Audio file too small - no data recorded' });
    }

    console.log('🎤 Starting OpenAI Whisper transcription...');

    // Read file buffer
    const buffer = await fs.promises.readFile(filePath);
    console.log('✅ Buffer read:', buffer.length, 'bytes');

    // Create file object for OpenAI - use proper extension
    const fileExt = path.extname(filePath) || '.webm';
    const fileName = `audio${fileExt}`;
    console.log('📎 Sending to OpenAI as:', fileName);

    const file = await OpenAI.toFile(buffer, fileName);

    const transcription = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      language: 'en' // Specify English for better accuracy
    });

    const transcript = transcription.text || transcription;
    console.log('✅ Transcription successful:', transcript.substring(0, 100) + '...');

    if (!transcript || transcript.length === 0) {
      console.error('⚠️ Empty transcript received');
      return res.status(400).json({ error: 'No speech detected in audio' });
    }

    // Return just the transcript - frontend will call analyze separately
    res.json({
      transcript,
      duration: req.file.size // approximate duration indicator
    });

  } catch (err) {
    console.error('❌ Transcription error:', err);
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);

    // Send detailed error to frontend
    let errorMessage = 'Transcription failed';
    if (err.message.includes('Invalid file format')) {
      errorMessage = 'Invalid audio format. Please try again.';
    } else if (err.message.includes('API key')) {
      errorMessage = 'OpenAI API key error. Please check configuration.';
    } else if (err.message.includes('rate limit')) {
      errorMessage = 'Rate limit exceeded. Please try again in a moment.';
    } else if (err.message) {
      errorMessage = `Transcription failed: ${err.message}`;
    }

    res.status(500).json({ error: errorMessage });
  } finally {
    // Clean up file
    fs.unlink(filePath, (unlinkErr) => {
      if (unlinkErr) {
        console.error('⚠️ Failed to delete temp file:', unlinkErr);
      } else {
        console.log('🗑️ Temp file deleted');
      }
    });
  }
});

module.exports = router;
