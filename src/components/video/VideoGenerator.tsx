"use client";

import { useEffect, useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { motion, AnimatePresence } from "framer-motion";
import { Clapperboard, UploadCloud, Video as VideoIcon, Sparkles, Loader2, X, AlertTriangle, Download, CheckCircle } from "lucide-react";

interface VideoGeneratorProps {
    initialPrompt: string;
    initialRatio?: string;
}

export default function VideoGenerator({ initialPrompt, initialRatio }: VideoGeneratorProps) {
    const [prompt, setPrompt] = useState("");
    const [ratio, setRatio] = useState(initialRatio || "9:16");
    const [selectedImages, setSelectedImages] = useState<(File | null)[]>([null, null, null]);
    const [imagePreviews, setImagePreviews] = useState<(string | null)[]>([null, null, null]);

    const [isGenerating, setIsGenerating] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (initialPrompt) {
            setPrompt(initialPrompt);
        }
    }, [initialPrompt]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const file = e.target.files?.[0];
        if (file) {
            const newImages = [...selectedImages];
            newImages[index] = file;
            setSelectedImages(newImages);

            const reader = new FileReader();
            reader.onloadend = () => {
                const newPreviews = [...imagePreviews];
                newPreviews[index] = reader.result as string;
                setImagePreviews(newPreviews);
            };
            reader.readAsDataURL(file);
        }
    };

    const clearImage = (index: number) => {
        const newImages = [...selectedImages];
        newImages[index] = null;
        setSelectedImages(newImages);

        const newPreviews = [...imagePreviews];
        newPreviews[index] = null;
        setImagePreviews(newPreviews);
    };

    const generateVideo = async () => {
        if (!prompt) {
            setError("Please provide a prompt for the video generation.");
            return;
        }

        const validImages = selectedImages.filter((img): img is File => img !== null);
        if (validImages.length === 0) {
            setError("Please upload at least one character image.");
            return;
        }

        setIsGenerating(true);
        setError(null);
        setVideoUrl(null);

        try {
            const formData = new FormData();
            formData.append("prompt", prompt);
            formData.append("ratio", ratio);

            validImages.forEach((img, i) => {
                formData.append(`image${i}`, img);
            });
            formData.append("imageCount", validImages.length.toString());

            // We'll call the API route
            const res = await fetch("/api/generate-video", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to generate video");
            }

            setVideoUrl(data.video_url);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred during rendering.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="w-full space-y-12 animate-in pb-32">
            <div className="text-center space-y-4 mb-12">
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-r from-white via-[#d4a373] to-white">
                    Cinematic Synthesis
                </h1>
                <p className="text-rosegold-200/60 font-medium tracking-[0.2em] uppercase text-xs md:text-sm">
                    Convert scripts into highly-realistic AI video
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                {/* Left Side: Controls */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-8 glassmorphism rounded-3xl p-8 border border-white/5 shadow-xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-8 scale-150 opacity-5 blur-2xl bg-gradient-to-br from-white to-[#d4a373] pointer-events-none"></div>

                    {/* Prompt Editor */}
                    <div className="space-y-3 relative z-10">
                        <label className="flex items-center gap-2 text-rosegold-400 font-bold uppercase tracking-widest text-xs">
                            <Sparkles className="w-4 h-4" />
                            Directorial Setup (Prompt)
                        </label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe the scene setup, lighting, and camera movement..."
                            className="w-full h-48 bg-black/40 text-white/90 p-5 rounded-2xl focus:outline-none focus:ring-1 focus:ring-rosegold-500/50 border border-white/10 resize-none font-mono text-sm leading-relaxed"
                        />
                        <div className="flex justify-end pt-1">
                            <CopyButton text={prompt} />
                        </div>
                    </div>

                    <div className="space-y-3 relative z-10">
                        <label className="flex items-center gap-2 text-rosegold-400 font-bold uppercase tracking-widest text-xs">
                            Format & Aspect Ratio
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {['9:16', '16:9', '4:5'].map(r => (
                                <button
                                    key={r}
                                    onClick={() => setRatio(r)}
                                    className={`py-3 rounded-xl border font-bold tracking-widest text-xs transition-all ${ratio === r ? 'border-rosegold-400 bg-rosegold-900/40 text-rosegold-200' : 'border-white/10 bg-black/40 text-white/50 hover:bg-white/5'}`}
                                >
                                    {r} {r === '9:16' && <span className="block text-[8px] opacity-70 mt-1 font-normal">Reels/Shorts</span>}
                                    {r === '16:9' && <span className="block text-[8px] opacity-70 mt-1 font-normal">YouTube</span>}
                                    {r === '4:5' && <span className="block text-[8px] opacity-70 mt-1 font-normal">Insta Post</span>}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Character Upload */}
                    <div className="space-y-3 relative z-10">
                        <label className="flex items-center justify-between text-white/50 font-bold uppercase tracking-widest text-xs">
                            <span>Target Identity (Up to 3 Characters)</span>
                        </label>

                        <div className="grid grid-cols-3 gap-3">
                            {[0, 1, 2].map((index) => {
                                const preview = imagePreviews[index];
                                return (
                                    <div key={index} className="relative w-full aspect-square border-2 border-dashed border-white/10 hover:border-rosegold-500/50 hover:bg-rosegold-900/10 rounded-2xl cursor-pointer transition-all group overflow-hidden flex flex-col items-center justify-center bg-black/40">
                                        {!preview ? (
                                            <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleImageChange(e, index)}
                                                    className="hidden"
                                                    disabled={isGenerating}
                                                />
                                                <UploadCloud className="w-5 h-5 md:w-6 md:h-6 text-white/30 group-hover:text-rosegold-400 transition-colors mb-1 md:mb-2" />
                                                <span className="text-[9px] md:text-[10px] font-bold tracking-widest uppercase text-white/30 group-hover:text-white/70">
                                                    Slot 0{index + 1}
                                                </span>
                                            </label>
                                        ) : (
                                            <>
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={preview} alt={`Character ${index + 1}`} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                    <button
                                                        onClick={() => clearImage(index)}
                                                        type="button"
                                                        className="p-2 md:p-3 bg-red-500/20 text-red-300 rounded-full hover:bg-red-500/40 hover:scale-110 transition-all border border-red-500/30"
                                                    >
                                                        <X className="w-4 h-4 md:w-5 md:h-5" />
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest text-center mt-2 group-hover:text-rosegold-400 transition-colors font-semibold">
                            JPG / PNG · Max 5MB per file
                        </p>
                    </div>

                    {/* Error Message */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, y: -10 }}
                                animate={{ opacity: 1, height: 'auto', y: 0 }}
                                exit={{ opacity: 0, height: 0, y: -10 }}
                                className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-200"
                            >
                                <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
                                <p className="text-sm font-medium leading-relaxed">{error}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Generate Button Button */}
                    <div className="pt-4 relative z-10">
                        <button
                            onClick={generateVideo}
                            disabled={isGenerating || !prompt}
                            className="w-full py-4 bg-gradient-to-r from-rosegold-500 to-[#d4a373] hover:from-rosegold-400 hover:to-white border border-rosegold-200/50 rounded-xl text-black shadow-[0_0_30px_rgba(230,184,162,0.3)] transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span className="text-sm font-bold uppercase tracking-widest">Rendering Cinematic Output...</span>
                                </>
                            ) : (
                                <>
                                    <Clapperboard className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-bold uppercase tracking-widest">Generate Video</span>
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>

                {/* Right Side: Output Viewer */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="glassmorphism rounded-3xl border border-white/5 shadow-xl relative overflow-hidden flex flex-col h-[600px] bg-black/20"
                >
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-md z-10 shrink-0">
                        <div className="flex items-center gap-3">
                            <VideoIcon className="w-5 h-5 text-rosegold-500" />
                            <h3 className="text-sm font-bold tracking-widest uppercase text-white/90">
                                Render Terminal
                            </h3>
                        </div>
                        {isGenerating && (
                            <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#d4a373] animate-pulse bg-[#d4a373]/10 px-3 py-1.5 rounded-full border border-[#d4a373]/20">
                                <Loader2 className="w-3 h-3 animate-spin" /> Engine Active
                            </span>
                        )}
                    </div>

                    {/* Player Area */}
                    <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden p-6 md:p-12">
                        <AnimatePresence mode="wait">
                            {isGenerating ? (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col items-center justify-center text-center max-w-sm space-y-6"
                                >
                                    <div className="relative">
                                        <div className="w-24 h-24 border-t-2 border-r-2 border-rosegold-500 rounded-full animate-spin"></div>
                                        <div className="w-24 h-24 border-b-2 border-l-2 border-[#d4a373] opacity-30 rounded-full animate-spin-reverse absolute inset-0"></div>
                                        <Clapperboard className="w-8 h-8 text-white/50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-white mb-2 uppercase tracking-widest">Synthesizing Pixels</h4>
                                        <p className="text-xs text-white/40 font-medium leading-relaxed uppercase tracking-widest">
                                            Stage 1: Identity Preservation Engine<br />
                                            Stage 2: Cinematic Lighting &amp; Depth<br />
                                            Stage 3: GenAI Video Synthesizing
                                        </p>
                                    </div>
                                </motion.div>
                            ) : videoUrl ? (
                                <motion.div
                                    key="result"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ type: "spring", bounce: 0.4 }}
                                    className="w-full h-full relative flex items-center justify-center group"
                                >
                                    <video
                                        src={videoUrl}
                                        controls
                                        autoPlay
                                        loop
                                        className="w-full h-full object-contain rounded-xl border border-white/10 shadow-2xl bg-black"
                                    />
                                    <a
                                        href={videoUrl}
                                        download={`ai-growth-render-${Date.now()}.mp4`}
                                        className="absolute top-4 right-4 bg-black/60 backdrop-blur opacity-0 group-hover:opacity-100 p-3 rounded-full border border-white/10 hover:border-rosegold-500 text-white hover:text-rosegold-300 transition-all"
                                        title="Download Video"
                                    >
                                        <Download className="w-5 h-5" />
                                    </a>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="idle"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center justify-center text-center opacity-30 space-y-4"
                                >
                                    <VideoIcon className="w-16 h-16 text-white/50" />
                                    <p className="text-xs uppercase tracking-[0.2em] font-bold text-white/70">Awaiting Render Command</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer Metadata */}
                    {videoUrl && (
                        <div className="px-6 py-4 bg-black/60 border-t border-white/5 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-[#d4a373]/60 shrink-0">
                            <span className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-rosegold-500" /> Render Completed</span>
                            <span>Resolution: 1080p | Format: MP4</span>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
