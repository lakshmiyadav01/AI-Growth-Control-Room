import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// Route segment config to increase the execution timeout for Vercel/NextJS serverless functions
// 300 seconds (5 minutes) matches our POLLING_TIMEOUT_MS
export const maxDuration = 300;
export const dynamic = 'force-dynamic';

const POLLING_TIMEOUT_MS = 300000; // 5 minutes
const POLLING_INTERVAL_MS = 5000;  // 5 seconds
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const VALID_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_PROMPT_LENGTH = 1500; // Security limit to prevent prompt token abuse

function constructSystemPrompt(userPrompt: string, charCount: number, ratio: string): string {
    // Incorporating Step 4 - Cinematic Engine & Step 1/2 Identity Preservation 
    // Suitable for our GenAI Video Engine Architecture
    const cinematicEngine = "Cinematic lighting, depth of field, film grain, light bloom, slow camera pan, background blur, natural shadows, ambient studio effects.";
    const identityPreservation = "Maintain the visual consistency based on the reference image.";
    const commonConstraints = `Make sure the final video adheres to a ${ratio} format.`;

    if (charCount > 1) {
        return `A 4-second cinematic shot featuring ${charCount} people based on the uploaded reference images. 
        Scene Context: ${userPrompt}. 
        Cinematography: ${cinematicEngine}. 
        Identity Protocol: ${identityPreservation}. 
        Constraints: ${commonConstraints}`;
    }
    return `A 4-second cinematic subject based on the uploaded reference image. 
    Scene Context: ${userPrompt}. 
    Cinematography: ${cinematicEngine}. 
    Identity Protocol: ${identityPreservation}. 
    Constraints: ${commonConstraints}`;
}

export async function POST(request: Request) {
    try {
        const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || "";
        if (!apiKey) {
            return NextResponse.json({ error: "API key is missing" }, { status: 500 });
        }

        const formData = await request.formData();
        const prompt = formData.get("prompt") as string;

        // Security: Validate prompt length and existence
        if (!prompt || prompt.length > MAX_PROMPT_LENGTH) {
            return NextResponse.json({ error: `Invalid prompt. Must be between 1 and ${MAX_PROMPT_LENGTH} characters.` }, { status: 400 });
        }

        const imageCountStr = formData.get("imageCount") as string;
        const imageCount = imageCountStr ? parseInt(imageCountStr, 10) : 0;

        if (imageCount === 0) {
            return NextResponse.json({ error: "No character image uploaded" }, { status: 400 });
        }

        // Find the primary image (we'll just use the first valid uploaded image, image0 or image)
        const primaryImageFile = formData.get("image0") as File || formData.get("image") as File;

        if (!primaryImageFile) {
            return NextResponse.json({ error: "Primary character image missing" }, { status: 400 });
        }

        if (primaryImageFile.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: "Image size exceeds 5MB limit" }, { status: 413 });
        }

        if (!VALID_MIME_TYPES.includes(primaryImageFile.type)) {
            return NextResponse.json({ error: "Invalid file type. Only JPG, PNG, and WebP are allowed." }, { status: 415 });
        }

        const ai = new GoogleGenAI({ apiKey });

        const arrayBuffer = await primaryImageFile.arrayBuffer();
        const base64Image = Buffer.from(arrayBuffer).toString('base64');
        const ratioParam = formData.get("ratio") as string || "9:16";
        const structuredPrompt = constructSystemPrompt(prompt, imageCount, ratioParam);

        let operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: structuredPrompt,
            image: { imageBytes: base64Image, mimeType: primaryImageFile.type || 'image/png' },
            config: {
                numberOfVideos: 1,
                aspectRatio: ratioParam
            }
        });

        const startTime = Date.now();
        // Efficiency: No need to initialize GoogleGenAI continuously in the loop
        while (operation && !operation.done) {
            if (Date.now() - startTime > POLLING_TIMEOUT_MS) {
                return NextResponse.json({ error: "Video generation timed out" }, { status: 504 });
            }
            // Optimization: Await using Promise with timeout correctly
            await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL_MS));

            operation = await ai.operations.getVideosOperation({ operation });
        }

        if (operation?.error) {
            const opErr = operation.error as { message?: string };
            throw new Error(opErr.message || "Operation failed.");
        }

        const downloadLink = operation?.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            throw new Error("Video generation failed: The AI model did not return a video link. This can happen with prompts that violate safety policies.");
        }

        // Return the direct uri (Google backend will handle serving it)
        return NextResponse.json({
            success: true,
            video_url: `${downloadLink}&key=${apiKey}`
        });

    } catch (error: any) {
        console.error("Gemini Video Gen API Error:", error);

        let statusCode = 500;
        let errMessage = "Unknown error occurred";

        if (error.status) {
            statusCode = error.status; // Get actual status code from GenAI sdk error
        } else if (error.statusText === "Permission Denied" || error.message?.includes("API key not valid")) {
            statusCode = 403;
        }

        if (error instanceof Error) {
            errMessage = error.message;
        } else if (typeof error === "object" && error.error && error.error.message) {
            errMessage = error.error.message;
        }

        return NextResponse.json(
            {
                error: statusCode === 403
                    ? "Invalid API Key: Please check your Gemini API Key in Google AI Studio and update your .env.local file."
                    : "Internal server error connecting to the generative engine.",
                details: errMessage
            },
            { status: statusCode }
        );
    }
}
