"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { ArrowLeft, Loader2 } from "lucide-react";

// Performance Optimization: Lazy load heavy interactive video component
const VideoGenerator = dynamic(() => import("@/components/video/VideoGenerator"), {
    loading: () => (
        <div className="flex flex-col items-center justify-center p-24 text-rosegold-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="text-sm font-bold tracking-widest uppercase">Initializing Canvas...</p>
        </div>
    ),
    ssr: false
});

function VideoPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const prompt = searchParams.get("prompt") || "";
    const ratio = searchParams.get("ratio") || "9:16";

    return (
        <div className="max-w-6xl mx-auto px-8 py-12 lg:px-16 w-full">
            <button
                onClick={() => router.back()}
                className="mb-8 flex items-center gap-2 text-rosegold-400 hover:text-rosegold-200 transition-colors uppercase text-xs font-bold tracking-widest"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Control Room
            </button>
            <VideoGenerator initialPrompt={decodeURIComponent(prompt)} initialRatio={ratio} />
        </div>
    );
}

export default function VideoPage() {
    return (
        <div className="min-h-screen bg-[#111111] text-white relative font-sans overflow-y-auto">
            {/* Background cinematic effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-rosegold-900/10 rounded-full blur-[120px] mix-blend-screen opacity-50 translate-x-1/3 -translate-y-1/3"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#d4a373] rounded-full blur-[150px] mix-blend-screen opacity-5 -translate-x-1/3 translate-y-1/3"></div>
            </div>

            <div className="relative z-10 w-full flex justify-center">
                <Suspense fallback={
                    <div className="flex h-screen w-full items-center justify-center">
                        <div className="animate-pulse text-rosegold-500 uppercase tracking-widest font-bold text-sm flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-rosegold-500 animate-bounce" />
                            Loading Cinematic Engine...
                        </div>
                    </div>
                }>
                    <VideoPageContent />
                </Suspense>
            </div>
        </div>
    );
}
