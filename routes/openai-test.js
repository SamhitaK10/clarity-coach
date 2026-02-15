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
 * GET /api/openai-test
 * Simple test to verify OpenAI API authentication works
 */
router.get('/', async (req, res) => {
  console.log('\n🧪 OpenAI test route hit');

  try {
    // Step 1: Verify API key exists
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error('❌ OPENAI_API_KEY not found in environment');
      return res.status(503).json({
        success: false,
        error: 'OPENAI_API_KEY not configured',
      });
    }

    console.log('✅ API Key exists:', apiKey.substring(0, 12) + '...');

    // Step 2: Send request to OpenAI models endpoint
    console.log('📡 Sending request to https://api.openai.com/v1/models');
    
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    console.log('Status:', response.status, response.statusText);

    // Step 3: Parse response
    const responseText = await response.text();

    if (!response.ok) {
      console.error('❌ OpenAI API error:', responseText);
      return res.status(response.status).json({
        success: false,
        status: response.status,
        error: responseText,
      });
    }

    console.log('✅ OpenAI API test successful');

    res.json({
      success: true,
      status: response.status,
      message: 'OpenAI API authentication working',
    });

  } catch (err) {
    console.error('❌ Error:', err.message);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;
