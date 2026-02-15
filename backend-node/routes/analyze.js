const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');

const router = express.Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const COACHING_SYSTEM = `
You are a supportive interview coach helping non-native English speakers improve clarity and confidence.

Given an interview answer, respond ONLY with valid JSON using these keys:

- clarity: Brief feedback on clarity and how to improve it.
- grammar: Specific grammar corrections if needed.
- phrasing: Suggest more natural or idiomatic phrasing.
- fillerWords: Identify filler words and advise reducing them.
- exampleSentence: ONE improved example sentence.
- followUp: Ask ONE short supportive follow-up question to help the user improve their answer.
- reply: A short, natural spoken coaching response (max 2 sentences) that sounds like a real coach speaking directly to the user.

Guidelines:
Keep tone supportive and human.
Keep responses concise.
End the reply with the follow-up question.
Respond ONLY with JSON.
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
      max_tokens: 800,
      system: COACHING_SYSTEM,
      messages: [{ role: 'user', content: userContent }],
    });

    const block = message.content.find((b) => b.type === 'text');
    const raw = block?.text ?? '';

    let feedback = null;
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      feedback = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      feedback = null;
    }

    if (!feedback) {
      return res.json({ error: "Coaching generation failed." });
    }

    // conversational voice reply (used by ElevenLabs)
    const coachReply =
      feedback.reply ||
      `${feedback.exampleSentence} ${feedback.followUp}`;

    res.json({
      clarity: feedback.clarity ?? '',
      grammar: feedback.grammar ?? '',
      phrasing: feedback.phrasing ?? '',
      fillerWords: feedback.fillerWords ?? '',
      exampleSentence: feedback.exampleSentence ?? '',
      followUp: feedback.followUp ?? 'Try answering again more concisely.',
      reply: feedback.reply ?? '',
      coachReply
    });

  } catch (err) {
    next(err);
  }
});

module.exports = router;
