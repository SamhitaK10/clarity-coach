const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');

const router = express.Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const COACHING_SYSTEM = `
You are an expert speech and interview coach analyzing recorded presentations for clarity, delivery, and effectiveness.

Given a transcript, provide a comprehensive analysis with numeric scores and actionable feedback.

Respond ONLY with valid JSON matching this exact structure:
{
  "overallScore": <number 0-100>,
  "summary": "<1-2 sentence overall assessment>",
  "categoryScores": [
    {
      "id": 1,
      "category": "Posture",
      "score": <number 0-100>,
      "insight": "<brief assessment>",
      "details": ["<specific observation>", "<specific observation>", ...]
    },
    {
      "id": 2,
      "category": "Eye Contact",
      "score": <number 0-100>,
      "insight": "<brief assessment>",
      "details": ["<specific observation>", ...]
    },
    {
      "id": 3,
      "category": "Clarity",
      "score": <number 0-100>,
      "insight": "<brief assessment>",
      "details": ["<specific observation>", ...]
    },
    {
      "id": 4,
      "category": "Pacing",
      "score": <number 0-100>,
      "insight": "<brief assessment>",
      "details": ["<specific observation>", ...]
    }
  ],
  "transcript": [
    {"type": "normal", "text": "<segment>"},
    {"type": "filler", "text": "<filler word>"},
    ...
  ],
  "strongMoments": [
    {"timestamp": "0:XX", "timeInSeconds": XX, "description": "<what went well>"},
    ...
  ],
  "areasToImprove": [
    {"timestamp": "0:XX", "timeInSeconds": XX, "description": "<what to improve>"},
    ...
  ]
}

Guidelines:
- Base Posture and Eye Contact scores on implied confidence and delivery quality (since we only have audio)
- Analyze Clarity based on articulation, pronunciation, and word choice
- Evaluate Pacing based on speech rhythm, pauses, and speaking rate
- Identify filler words (um, uh, like, you know, etc.) and mark them in transcript
- Provide 2-3 strong moments and 2-3 areas for improvement with estimated timestamps
- Keep tone constructive and supportive
- Respond ONLY with valid JSON
`;

router.post('/', express.json(), async (req, res, next) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: 'Analysis not configured: ANTHROPIC_API_KEY missing' });
  }

  const { transcript, question } = req.body;
  const text = transcript || req.body.text;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Request body must include "transcript" or "text".' });
  }

  const userContent = question
    ? `Question: ${question}\n\nAnswer:\n${text}`
    : `Answer:\n${text}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: COACHING_SYSTEM,
      messages: [{ role: 'user', content: userContent }],
    });

    const block = message.content.find((b) => b.type === 'text');
    const raw = block?.text ?? '';

    let analysis = null;
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (err) {
      console.error('Failed to parse analysis JSON:', err);
      analysis = null;
    }

    if (!analysis || !analysis.overallScore) {
      return res.status(500).json({ error: "Analysis generation failed." });
    }

    res.json(analysis);

  } catch (err) {
    next(err);
  }
});

module.exports = router;
