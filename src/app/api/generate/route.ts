import { NextResponse } from "next/server";
import { calculateHookScore } from "@/lib/scoring";
import { generateCampaign } from "@/lib/ai";
import { Campaign } from "@/lib/types";

// Security: Rate limiting suggestion
// import { Ratelimit } from "@upstash/ratelimit";
// import { Redis } from "@upstash/redis";
// const ratelimit = new Ratelimit({ redis: Redis.fromEnv(), limiter: Ratelimit.slidingWindow(5, "1 m") });

const MAX_PROMPT_LENGTH = 1500;

export async function POST(req: Request) {
  try {
    // Security: Check IP rate limits here if uncommented

    let body;
    try {
      body = await req.json();
    } catch (e: unknown) {
      return NextResponse.json({ error: "Invalid JSON format in request" }, { status: 400 });
    }

    const { topic, platform, targetAudience, tone } = body;

    // Security & Validation
    if (!topic || typeof topic !== "string") {
      return NextResponse.json({ error: "Topic is required and must be a string" }, { status: 400 });
    }

    if (topic.length > MAX_PROMPT_LENGTH) {
      return NextResponse.json({ error: `Topic is too long. Max ${MAX_PROMPT_LENGTH} characters.` }, { status: 400 });
    }

    // Call AI Logic
    let parsed;
    try {
      const aiResponse = await generateCampaign({ topic, platform, targetAudience, tone });
      parsed = aiResponse.rawData;
    } catch (error: unknown) {
      console.error("AI Generation failed:", error);
      return NextResponse.json(
        { error: "Failed to generate or parse AI response" },
        { status: 500 }
      );
    }

    if (!parsed || typeof parsed !== "object") {
      return NextResponse.json(
        { error: "Invalid AI response structure" },
        { status: 500 }
      );
    }

    // Scoring calculation
    const hookToScore = typeof parsed.primaryHook === "string" ? parsed.primaryHook : "";
    const scores = calculateHookScore(hookToScore);
    parsed.hookIntelligence = scores;

    // Attach metadata
    const campaign: Partial<Campaign> = {
      ...parsed,
      id: crypto.randomUUID(),
      topic,
      platform: platform || "All Platforms",
      targetAudience: targetAudience || "General Audience",
      tone: tone || "Inspirational",
      createdAt: Date.now(),
    };

    return NextResponse.json(campaign);
  } catch (error: any) {
    console.error("API Error generating campaign:", error);

    let statusCode = 500;
    if (error.status) {
      statusCode = error.status;
    } else if (error.message?.includes("API key not valid") || error.message?.includes("Permission Denied")) {
      statusCode = 403;
    }

    const errorMessage = statusCode === 403
      ? "Invalid API Key: Please check your Gemini API Key in Google AI Studio and update your .env.local file."
      : "Internal server error connecting to the generative engine.";

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}
