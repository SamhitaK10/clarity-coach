const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');

const router = express.Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const COACHING_SYSTEM = `You are an expert interview coach for non-native English speakers. Given a transcript of an interview practice session (or a candidate's answer), provide structured feedback in JSON format with these exact keys:
- clarity: How clear was the answer? Point out unclear parts and suggest ways to express ideas more clearly.
- grammar: List specific grammar errors (wrong tense, articles, prepositions, subject-verb agreement, etc.) with corrections.
- phrasing: Suggest more natural, idiomatic phrasing for awkward or non-native-sounding expressions.
- fillerWords: Identify filler words (um, uh, like, you know, actually, basically) and advise on reducing them for a more confident delivery.
- exampleSentence: Provide exactly one improved example sentence that incorporates your best suggestions.
Respond ONLY with valid JSON, no other text. Be constructive and specific.`;

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
    ? `Question: ${question}\n\nTranscript/Answer:\n${text}`
    : `Transcript/Answer:\n${text}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: COACHING_SYSTEM,
      messages: [{ role: 'user', content: userContent }],
    });

    const block = message.content.find((b) => b.type === 'text');
    const raw = block?.text ?? 'No feedback generated.';

    let feedback;
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      feedback = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      feedback = null;
    }

    if (feedback && typeof feedback.clarity === 'string' && typeof feedback.exampleSentence === 'string') {
      res.json({
        clarity: feedback.clarity,
        grammar: feedback.grammar ?? '',
        phrasing: feedback.phrasing ?? '',
        fillerWords: feedback.fillerWords ?? '',
        exampleSentence: feedback.exampleSentence,
      });
    } else {
      res.json({ coaching: raw });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
