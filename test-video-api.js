const { GoogleGenAI } = require("@google/genai");

async function main() {
    // DO NOT hardcode the API key here, use an environment variable or a safe placeholder
    const apiKey = process.env.GEMINI_API_KEY || "[YOUR_API_KEY_HERE]";
    const ai = new GoogleGenAI({ apiKey });
    try {
        console.log("Generating video...");
        // Wait, the Next app uses model 'veo-2.0-generate-001'
        // Let's just test if we can list models or call it
        let operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: "A beautiful cinematic shot of a cat",
            // image: { imageBytes: 'base64...', mimeType: 'image/png' },
            config: {
                aspectRatio: "16:9"
            }
        });
        console.log(operation);
    } catch (e) {
        console.error(e);
    }
}
main();
