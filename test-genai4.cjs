const fs = require('fs');

async function testKey() {
    const envFile = fs.readFileSync('.env.local', 'utf8');
    let key = envFile.split('\n').find(l => l.startsWith('GEMINI_API_KEY=')).split('=')[1].trim();
    console.log('Key before replace:', JSON.stringify(key));
    if (key.startsWith('"') && key.endsWith('"')) {
        key = key.slice(1, -1);
    }
    console.log('Key after replace:', JSON.stringify(key));

    const { GoogleGenAI } = require('@google/genai');
    const ai = new GoogleGenAI({ apiKey: key });
    try {
        const base64Image = fs.readFileSync('test.png', 'base64');
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
testKey();
