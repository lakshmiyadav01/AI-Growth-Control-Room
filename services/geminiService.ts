
import { GoogleGenAI, VideoGenerationReferenceImage, VideoGenerationReferenceType } from "@google/genai";
import type { AspectRatio, ProgressCallback } from "../types";
import { LOADING_MESSAGES } from "../constants";
import { validateGenerationConfig } from "../utils/validation";

const POLLING_TIMEOUT_MS = 300000; // 5 minutes
const POLLING_INTERVAL_MS = 5000;  // 5 seconds
const MAX_RETRIES = 1;

/**
 * Translates raw API or operational errors into clean, user-facing messages.
 * This function is the single source of truth for error interpretation.
 * @param error The raw error object from a try-catch block.
 * @param operation The state of the video generation operation, if available.
 * @returns A user-friendly error string.
 */
function translateError(error: any, operation?: any): string {
    console.error("Gemini Service Raw Error:", {
        message: error.message,
        error: JSON.stringify(error, null, 2),
        operation: JSON.stringify(operation, null, 2)
    });

    // Case 1: The operation itself returned a structured error.
    if (operation?.error?.message) {
        const opErrorMsg = operation.error.message.toLowerCase();
        if (opErrorMsg.includes('moderation')) {
            return "Video generation failed: The prompt or image violates safety policies. Please revise and try again.";
        }
        if (opErrorMsg.includes('aspect_ratio') || opErrorMsg.includes('invalid argument')) {
            return "Video generation failed: The selected settings (e.g., aspect ratio for multi-character) are unsupported by the model.";
        }
        return `Video generation failed: ${operation.error.message}`;
    }

    // Case 2: A network or API error occurred during the request.
    const errorMessage = (error.message || 'An unknown error occurred').toLowerCase();

    if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('resource_exhausted')) {
        return "Server is busy: You've exceeded your request limit. Please wait a moment or check your Google AI plan details.";
    }
    if (errorMessage.includes('api key not valid') || errorMessage.includes('permission denied')) {
        return "Permission Denied. Please ensure your API key is from a Google Cloud project with Billing enabled and the 'Vertex AI API' activated, then select your key again.";
    }
    if (errorMessage.includes('timed out')) {
        return "Server busy: The video generation request timed out. Please try again in a few moments.";
    }

    // Case 3: Generic fallback for unhandled errors.
    return "An unexpected error occurred. Please check the console for details and try again.";
}


/**
 * Constructs a detailed, structured prompt for the Veo model.
 */
function constructSystemPrompt(userPrompt: string, charCount: number, ratio: AspectRatio): string {
    let commonStyle = "Ultra realistic, 8k, cinematic lighting, smooth motion, shallow depth of field, high detail.";
    const commonConstraints = "No violence, nudity, or political content. Preserve facial identity accurately.";

    // Add specific instructions for multi-character vertical videos to improve composition.
    if (charCount > 1 && ratio === '9:16') {
        commonStyle += " Prioritize a vertical composition with a depth layout to fit characters naturally. Use dynamic camera motion (like a pan or tilt) to enhance the scene.";
    }

    if (charCount > 1) {
        return `A 4-second cinematic video featuring ${charCount} distinct people based on the reference images. Scene: ${userPrompt}. Style: ${commonStyle}. Format: ${ratio}. ${commonConstraints}`;
    }
    return `A 4-second cinematic video of a person. Scene: ${userPrompt}. Style: ${commonStyle}. Format: ${ratio}. ${commonConstraints}`;
}

/**
 * Generates a character image from a text prompt.
 * @param prompt The text prompt describing the character.
 * @returns A base64 encoded string of the generated image.
 */
export async function generateCharacterImage(prompt: string): Promise<string> {
    try {
        const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || "";
        if (!apiKey) throw new Error("API key is missing");

        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }],
            },
            config: {
                imageConfig: { aspectRatio: "1:1" },
            },
        });

        // Iterate through parts to find the image data, as response can contain multiple parts.
        const parts = response.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
            if (part.inlineData) {
                if (part.inlineData.data) {
                    return part.inlineData.data;
                }
            }
        }
        throw new Error("Image generation succeeded but no image data was returned. This may be due to a safety policy violation.");

    } catch (error: any) {
        // Use the same robust error translator for consistency
        throw new Error(translateError(error));
    }
}


/**
 * Main function to generate video, including validation, polling, and robust error handling.
 */
export async function generateVideo(
    characterImages: string[],
    prompt: string,
    aspectRatio: AspectRatio,
    onProgress: ProgressCallback,
    retryCount = 0
): Promise<string> {

    // 1. Pre-flight Validation
    const configValidation = validateGenerationConfig(characterImages.length, aspectRatio);
    if (!configValidation.isValid) {
        throw new Error(configValidation.message!);
    }

    const structuredPrompt = constructSystemPrompt(prompt, characterImages.length, aspectRatio);
    let operation: any;

    try {
        const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || "";
        if (!apiKey) throw new Error("API key is missing");

        const ai = new GoogleGenAI({ apiKey });
        const isMultiCharacter = characterImages.length > 1;
        onProgress(5, LOADING_MESSAGES[0]);

        // 2. Initiate Generation
        if (isMultiCharacter) {
            const referenceImagesPayload: VideoGenerationReferenceImage[] = characterImages.map(imgBase64 => ({
                image: { imageBytes: imgBase64, mimeType: 'image/png' },
                referenceType: VideoGenerationReferenceType.ASSET,
            }));
            operation = await ai.models.generateVideos({
                model: 'veo-3.1-generate-preview',
                prompt: structuredPrompt,
                config: { numberOfVideos: 1, referenceImages: referenceImagesPayload, resolution: '1080p', aspectRatio }
            });
        } else {
            operation = await ai.models.generateVideos({
                model: 'veo-3.1-fast-generate-preview',
                prompt: structuredPrompt,
                image: { imageBytes: characterImages[0], mimeType: 'image/png' },
                config: { numberOfVideos: 1, resolution: '1080p', aspectRatio }
            });
        }

        // 3. Asynchronous Polling
        let progressCount = 1;
        onProgress(15, LOADING_MESSAGES[1]);
        const startTime = Date.now();

        while (operation && !operation.done) {
            if (Date.now() - startTime > POLLING_TIMEOUT_MS) {
                throw new Error("Video generation timed out.");
            }
            await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL_MS));

            // Re-create AI instance to ensure fresh credentials if they were updated mid-flight
            const pollingAi = new GoogleGenAI({ apiKey });
            operation = await pollingAi.operations.getVideosOperation({ operation });

            const progressPercentage = 15 + (progressCount * 5);
            onProgress(Math.min(progressPercentage, 90), LOADING_MESSAGES[progressCount % LOADING_MESSAGES.length]);
            progressCount++;
        }

        // 4. Process Final Result
        if (operation?.error) {
            throw new Error("Operation failed."); // Let the central catch block handle translation
        }

        const downloadLink = operation?.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            // This is the key case: success from API but no video, often a silent safety filter.
            throw new Error("Video generation failed: The AI model did not return a video link. This can happen with prompts that violate safety policies or use unsupported configurations. Please try a different prompt.");
        }

        onProgress(95, "Finalizing video...");
        const response = await fetch(`${downloadLink}&key=${apiKey}`);
        if (!response.ok) throw new Error(`Failed to download video: ${response.statusText}`);

        const videoBlob = await response.blob();
        const videoUrl = URL.createObjectURL(videoBlob);

        onProgress(100, "Video ready!");
        return videoUrl;

    } catch (error: any) {
        // 5. Centralized Error Handling & Retry Logic
        if (error.message.includes("timed out") && retryCount < MAX_RETRIES) {
            console.warn(`Generation timed out. Retrying... (Attempt ${retryCount + 1})`);
            onProgress(10, "Server was busy. Retrying your request...");
            return generateVideo(characterImages, prompt, aspectRatio, onProgress, retryCount + 1);
        }
        // Translate the final error (from any stage) into a user-friendly message
        throw new Error(translateError(error, operation));
    }
}