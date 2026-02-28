const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
const key = envFile.split('\n').find(l => l.startsWith('GEMINI_API_KEY=')).split('=')[1].trim();

async function test() {
    const ai = new GoogleGenAI({ apiKey: key });
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
        if (e.statusDetails) console.dir(e.statusDetails, { depth: null });
        console.dir(e, { depth: null });
    }
}
test();
