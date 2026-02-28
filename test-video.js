const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

async function run() {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    try {
        const imageBytes = fs.readFileSync('package.json', 'base64');
        const operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: 'testing',
            config: {
                aspectRatio: '9:16',
                resolution: '1080p'
            }
        });
        console.log(operation);
    } catch (e) {
        console.dir(e, { depth: null, color: true });
    }
}
run();
