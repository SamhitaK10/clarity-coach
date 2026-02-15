const express = require('express');

// Use native fetch (Node 18+) or require node-fetch as fallback
let fetch;
if (typeof global.fetch !== 'function') {
  fetch = require('node-fetch');
} else {
  fetch = global.fetch;
}

const router = express.Router();

/**
 * POST /api/session
 * Creates an OpenAI Realtime API session and returns the session token
 */
router.post('/', async (req, res) => {
  console.log('\n🎤 Session route hit');

  try {
    // Step 1: Verify API key exists
    let apiKey = process.env.OPENAI_API_KEY;
    
    console.log('Key exists:', !!apiKey);
    if (!apiKey) {
      console.error('❌ OPENAI_API_KEY not found in environment');
      return res.status(503).json({
        error: 'OPENAI_API_KEY not configured',
      });
    }

    // Trim whitespace
    apiKey = apiKey.trim();
    console.log('Key preview:', apiKey.substring(0, 6) + '...');
    console.log('Key length:', apiKey.length);

    // Step 2: Build request body
    const requestBody = {
      model: 'gpt-4o-realtime-preview',
      voice: 'verse',
    };

    console.log('📡 Sending POST to https://api.openai.com/v1/realtime/sessions');
    console.log('Headers:', {
      'Authorization': `Bearer ${apiKey.substring(0, 6)}...***`,
      'Content-Type': 'application/json',
    });
    console.log('Body:', requestBody);

    // Step 3: Send request to OpenAI
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Response status:', response.status, response.statusText);

    // Step 4: Parse response
    const responseText = await response.text();

    if (!response.ok) {
      console.error('❌ OpenAI API error:');
      console.error('Status:', response.status);
      console.error('Error body:', responseText);
      
      return res.status(response.status).json({
        error: 'OpenAI API failed',
        status: response.status,
        details: responseText,
      });
    }

    // Step 5: Parse successful response
    let session;
    try {
      session = JSON.parse(responseText);
    } catch (parseErr) {
      console.error('❌ Failed to parse response:', parseErr.message);
      return res.status(500).json({
        error: 'Failed to parse OpenAI response',
        details: parseErr.message,
      });
    }

    console.log('✅ Session created successfully');
    console.log('Session keys:', Object.keys(session));

    // Step 6: Send response to client
    res.json({
      client_secret: session.client_secret,
      session_id: session.id,
      expires_at: session.expires_at,
      url: session.url,
    });

  } catch (err) {
    console.error('❌ Error:', err.message);
    res.status(500).json({
      error: 'Failed to create session',
      message: err.message,
    });
  }
});

module.exports = router;
