const express = require('express');
const OpenAI = require('openai');

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const COACH_SYSTEM_PROMPT = `You are a supportive and encouraging speech coach having a voice conversation with someone who just practiced their elevator pitch or interview answer.

Your role:
- Provide constructive feedback and encouragement
- Answer questions about their performance
- Give specific tips to improve clarity, pacing, body language, and confidence
- Keep responses conversational and natural (you're speaking, not writing)
- Keep responses concise (2-4 sentences max) since this is a voice conversation
- Be warm, supportive, and motivating
- Reference their specific performance when relevant

Guidelines:
- Speak naturally like you're having a real conversation
- Use "you" and "your" to make it personal
- Avoid bullet points or lists in speech
- Keep it encouraging but honest
- Ask follow-up questions to keep the conversation going`;

router.post('/', express.json(), async (req, res, next) => {
  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ error: 'Conversation not configured: OPENAI_API_KEY missing' });
  }

  const { message, conversationHistory = [], analysisContext } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Request body must include "message" (string).' });
  }

  try {
    // Build conversation messages
    const messages = [
      { role: 'system', content: COACH_SYSTEM_PROMPT }
    ];

    // Add analysis context if this is the first message
    if (analysisContext && conversationHistory.length === 0) {
      messages.push({
        role: 'system',
        content: `The user just completed a practice session with these results:
- Overall Score: ${analysisContext.overallScore}/100
- Summary: ${analysisContext.summary}
- Categories: ${analysisContext.categoryScores?.map(c => `${c.category}: ${c.score}/100`).join(', ')}

Use this context to provide relevant feedback during the conversation.`
      });
    }

    // Add conversation history
    conversationHistory.forEach(msg => {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    });

    // Add current user message
    messages.push({
      role: 'user',
      content: message
    });

    // Get AI response
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: messages,
      max_tokens: 200,
      temperature: 0.8,
    });

    const aiResponse = completion.choices[0].message.content;

    res.json({
      response: aiResponse,
      conversationHistory: [
        ...conversationHistory,
        { role: 'user', content: message },
        { role: 'assistant', content: aiResponse }
      ]
    });

  } catch (err) {
    console.error('Conversation error:', err);
    next(err);
  }
});

module.exports = router;
