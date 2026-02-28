import { NextResponse } from "next/server";
import { refineContent } from "@/lib/ai";

const MAX_PROMPT_LENGTH = 1500;
const MAX_CONTENT_LENGTH = 3000;

export async function POST(req: Request) {
    try {
        let body;
        try {
            body = await req.json();
        } catch (e: unknown) {
            return NextResponse.json({ error: "Invalid JSON format in request" }, { status: 400 });
        }

        const { type, content, topic, instruction } = body;

        // Security & Validation
        if (!type || typeof type !== "string" || !instruction || typeof instruction !== "string") {
            return NextResponse.json({ error: "Type and instruction are required as strings" }, { status: 400 });
        }

        if (instruction.length > MAX_PROMPT_LENGTH) {
            return NextResponse.json({ error: "Instruction length exceeded limits" }, { status: 400 });
        }

        if (content && typeof content === "string" && content.length > MAX_CONTENT_LENGTH) {
            return NextResponse.json({ error: "Content length exceeded limits" }, { status: 400 });
        }

        if (topic && typeof topic === "string" && topic.length > MAX_PROMPT_LENGTH) {
            return NextResponse.json({ error: "Topic length exceeded limits" }, { status: 400 });
        }

        // Delegate to AI service
        let result;
        try {
            result = await refineContent({ type, topic, content, instruction });
        } catch (error: unknown) {
            console.error("AI Refine failed:", error);
            return NextResponse.json(
                { error: "Failed to refine content via AI module" },
                { status: 500 }
            );
        }

        return NextResponse.json({ result });
    } catch (error: unknown) {
        console.error("API Error refining content:", error);
        // Security: Log error, but don't return stack trace
        return NextResponse.json(
            { error: "Internal server error connecting to the generative engine." },
            { status: 500 }
        );
    }
}

