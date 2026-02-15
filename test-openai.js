require('dotenv').config();
const OpenAI = require('openai');

console.log('Testing OpenAI API key...');
console.log('API Key present:', !!process.env.OPENAI_API_KEY);
console.log('API Key starts with:', process.env.OPENAI_API_KEY?.substring(0, 20) + '...');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function testAPI() {
  try {
    console.log('\nTesting API with simple models list...');
    const models = await openai.models.list();
    console.log('✅ API key is valid!');
    console.log('Found', models.data.length, 'models');
    process.exit(0);
  } catch (error) {
    console.error('❌ API key test failed!');
    console.error('Error:', error.message);
    console.error('Status:', error.status);
    console.error('Type:', error.type);
    process.exit(1);
  }
}

testAPI();
