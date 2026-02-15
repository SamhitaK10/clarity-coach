require('dotenv').config();
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

console.log('Testing Whisper transcription...');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function testWhisper() {
  try {
    // Create a minimal test audio file (silence)
    console.log('\n1. Creating test audio file...');
    const testDir = path.join(__dirname, 'test-audio');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    // Create a minimal WAV file (1 second of silence)
    const wavHeader = Buffer.from([
      0x52, 0x49, 0x46, 0x46, // "RIFF"
      0x24, 0x00, 0x00, 0x00, // File size - 8
      0x57, 0x41, 0x56, 0x45, // "WAVE"
      0x66, 0x6D, 0x74, 0x20, // "fmt "
      0x10, 0x00, 0x00, 0x00, // Subchunk1Size (16 for PCM)
      0x01, 0x00,             // AudioFormat (1 for PCM)
      0x01, 0x00,             // NumChannels (1)
      0x44, 0xAC, 0x00, 0x00, // SampleRate (44100)
      0x88, 0x58, 0x01, 0x00, // ByteRate
      0x02, 0x00,             // BlockAlign
      0x10, 0x00,             // BitsPerSample (16)
      0x64, 0x61, 0x74, 0x61, // "data"
      0x00, 0x00, 0x00, 0x00  // Subchunk2Size
    ]);

    const testFile = path.join(testDir, 'test.wav');
    fs.writeFileSync(testFile, wavHeader);
    console.log('✅ Test file created:', testFile);

    // Test method 1: Direct file path
    console.log('\n2. Testing with file path...');
    try {
      const transcription1 = await openai.audio.transcriptions.create({
        file: fs.createReadStream(testFile),
        model: 'whisper-1',
      });
      console.log('✅ File path method works!');
      console.log('Result:', transcription1.text);
    } catch (err) {
      console.error('❌ File path method failed:', err.message);
    }

    // Test method 2: Buffer with toFile
    console.log('\n3. Testing with Buffer + toFile...');
    try {
      const buffer = fs.readFileSync(testFile);
      const file = await OpenAI.toFile(buffer, 'test.wav');
      const transcription2 = await openai.audio.transcriptions.create({
        file: file,
        model: 'whisper-1',
      });
      console.log('✅ Buffer + toFile method works!');
      console.log('Result:', transcription2.text);
    } catch (err) {
      console.error('❌ Buffer + toFile method failed:', err.message);
      console.error('Error type:', err.constructor.name);
      console.error('Full error:', err);
    }

    // Cleanup
    fs.unlinkSync(testFile);
    fs.rmdirSync(testDir);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed!');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testWhisper();
