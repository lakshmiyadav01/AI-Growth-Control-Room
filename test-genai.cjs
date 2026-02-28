const { GoogleGenAI } = require('@google/genai');

async function test() {
    const ai = new GoogleGenAI({ apiKey: "dummy" });
    try {
        const ai2 = new GoogleGenAI({ apiKey: "dummy" });
        const req = {
            model: 'veo-2.0-generate-001',
            prompt: 'test',
            // What is the valid structure for image reference?
        };
        console.log(JSON.stringify(req, null, 2));
    } catch (e) {
        console.error(e);
    }
}
test();
