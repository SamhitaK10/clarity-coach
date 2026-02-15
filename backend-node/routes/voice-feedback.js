const express = require("express");
const fetch = require("node-fetch");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { text } = req.body;

    const response = await fetch(
      "https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL",
      {
        method: "POST",
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
        }),
      }
    );

    // Check if ElevenLabs API call was successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);

      // Try to parse error message
      let errorMessage = 'Voice generation failed';
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.detail?.status === 'quota_exceeded') {
          errorMessage = 'ElevenLabs quota exceeded. Please check your API usage.';
        } else if (errorJson.detail?.message) {
          errorMessage = errorJson.detail.message;
        }
      } catch (e) {
        // If not JSON, use text directly
        errorMessage = errorText || 'Voice generation failed';
      }

      return res.status(response.status).json({ error: errorMessage });
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString("base64");

    res.json({ audio: base64Audio });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Voice generation failed" });
  }
});

module.exports = router;
