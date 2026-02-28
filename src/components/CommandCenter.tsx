"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Sparkles, Send, ChevronDown } from "lucide-react";
import { Campaign } from "@/lib/types";

interface CommandCenterProps {
    onGenerated: (campaign: Campaign) => void;
}

export function CommandCenter({ onGenerated }: CommandCenterProps) {
    const [prompt, setPrompt] = useState("");
    const [platform, setPlatform] = useState("All Platforms");
    const [targetAudience, setTargetAudience] = useState("Founders");
    const [tone, setTone] = useState("Inspirational");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || loading) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topic: prompt, platform, targetAudience, tone }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Generation failed");
            }

            onGenerated(data);
            setPrompt("");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-3xl mx-auto w-full glassmorphism rounded-3xl p-1 shadow-2xl relative group"
        >
            <div className="absolute inset-0 bg-rosegold-gradient opacity-20 rounded-3xl blur transition duration-1000 group-hover:opacity-30"></div>

            <div className="bg-[#111111]/90 rounded-[1.4rem] p-8 relative z-10 backdrop-blur-3xl border border-white/5">
                <div className="flex items-center gap-3 mb-6 px-2 text-rosegold-100/60 font-medium tracking-widest text-sm uppercase">
                    <Sparkles className="w-5 h-5 text-rosegold-500" />
                    <span>Initialize Creative Sequence</span>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-[#ecd2c7]/70 ml-1">Platform</label>
                            <div className="relative">
                                <select
                                    value={platform}
                                    onChange={(e) => setPlatform(e.target.value)}
                                    disabled={loading}
                                    className="w-full bg-black/40 text-white/90 rounded-xl p-4 pr-10 focus:outline-none focus:ring-1 focus:ring-rosegold-500/50 border border-white/10 transition-all cursor-pointer appearance-none"
                                >
                                    <option value="All Platforms">All Platforms</option>
                                    <option value="Instagram">Instagram</option>
                                    <option value="LinkedIn">LinkedIn</option>
                                    <option value="YouTube Shorts">YouTube Shorts</option>
                                    <option value="TikTok">TikTok</option>
                                    <option value="Twitter">Twitter</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-[#ecd2c7]/70 ml-1">Target Audience</label>
                            <div className="relative">
                                <select
                                    value={targetAudience}
                                    onChange={(e) => setTargetAudience(e.target.value)}
                                    disabled={loading}
                                    className="w-full bg-black/40 text-white/90 rounded-xl p-4 pr-10 focus:outline-none focus:ring-1 focus:ring-rosegold-500/50 border border-white/10 transition-all cursor-pointer appearance-none"
                                >
                                    <option value="Founders">Founders</option>
                                    <option value="Creators">Creators</option>
                                    <option value="Students">Students</option>
                                    <option value="Developers">Developers</option>
                                    <option value="General Audience">General Audience</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-[#ecd2c7]/70 ml-1">Tone</label>
                            <div className="relative">
                                <select
                                    value={tone}
                                    onChange={(e) => setTone(e.target.value)}
                                    disabled={loading}
                                    className="w-full bg-black/40 text-white/90 rounded-xl p-4 pr-10 focus:outline-none focus:ring-1 focus:ring-rosegold-500/50 border border-white/10 transition-all cursor-pointer appearance-none"
                                >
                                    <option value="Inspirational">Inspirational</option>
                                    <option value="Aggressive & Bold">Aggressive & Bold</option>
                                    <option value="Cinematic & Luxury">Cinematic & Luxury</option>
                                    <option value="Educational">Educational</option>
                                    <option value="Controversial">Controversial</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <div className="relative group/input">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="E.g., Promote my new AI-powered Notion template to student founders..."
                            className="w-full bg-black/40 text-white/90 placeholder-white/30 rounded-2xl p-6 min-h-[140px] resize-none focus:outline-none focus:ring-1 focus:ring-rosegold-500/50 border border-white/10 transition-all font-light text-lg tracking-wide leading-relaxed"
                            disabled={loading}
                        />
                        {/* Subtle glow border */}
                        <div className="absolute inset-0 pointer-events-none rounded-2xl border border-transparent group-focus-within/input:border-rosegold-500/30 transition-colors duration-500"></div>
                    </div>

                    <div className="flex items-center justify-between px-2">
                        <p className="text-red-400 text-sm">{error}</p>
                        <button
                            type="submit"
                            disabled={loading || !prompt.trim()}
                            className="group relative ml-auto flex items-center justify-center gap-3 rounded-full px-8 py-4 bg-white hover:bg-rosegold-100 text-[#111] font-bold tracking-widest uppercase transition-all overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="absolute inset-0 bg-rosegold-gradient opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin text-[#d4a373]" />
                                    <span className="text-white/80 animate-pulse">Processing...</span>
                                </>
                            ) : (
                                <>
                                    <span className="relative z-10 text-gray-900 group-hover:text-amber-900 transition-colors">Deploy Command</span>
                                    <Send className="w-5 h-5 group-hover:text-amber-900 group-hover:translate-x-1 transition-all z-10 text-gray-900" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
}
