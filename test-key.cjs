const { GoogleGenAI } = require("@google/genai");

async function checkKey() {
    const key = "[ENCRYPTION_KEY]";
    const ai = new GoogleGenAI({ apiKey: key });
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Hi"
        });
        console.log("Success! Key is valid.", response.text);
    } catch (e) {
        console.error("API Error:", e.status, e.message);
    }
}
checkKey();
