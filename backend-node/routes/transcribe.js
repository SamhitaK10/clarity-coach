const express = require('express');
const multer = require('multer');
const OpenAI = require('openai');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');

const router = express.Router();
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
  if (!req.file) {
    return res.status(400).json({ error: 'No audio file uploaded' });
  }

  const filePath = req.file.path;

  try {
    // 1️⃣ Transcribe audio
    const buffer = await fs.promises.readFile(filePath);
    const file = await OpenAI.toFile(buffer, path.basename(filePath));

    const transcription = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1'
    });

    const transcript = transcription.text || transcription;

    // 2️⃣ Get coaching feedback
    const analyzeRes = await fetch("http://localhost:3000/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: transcript })
    });

    const feedback = await analyzeRes.json();

    // 3️⃣ Generate spoken coaching tip
    const voiceRes = await fetch("http://localhost:3000/api/voice-feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: feedback.exampleSentence
      })
    });

    const voice = await voiceRes.json();

    // 4️⃣ Return everything
    res.json({
      transcript,
      feedback,
      audio: voice.audio
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Processing failed" });
  } finally {
    fs.unlink(filePath, () => {});
  }
});

module.exports = router;
