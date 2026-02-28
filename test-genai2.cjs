const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

async function test() {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    try {
        const base64Image = fs.readFileSync('package.json', 'base64');
        let operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: "A test video",
            image: { imageBytes: base64Image, mimeType: 'image/png' },
            config: { numberOfVideos: 1, aspectRatio: '9:16' }
        });
        console.log(operation);
    } catch (e) {
        console.dir(e, { depth: null });
    }
}
test();
