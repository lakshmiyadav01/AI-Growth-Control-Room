"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Campaign } from "@/lib/types";
import { AnimatedCircularProgress } from "./AnimatedCircularProgress";
import { CopyButton } from "./CopyButton";
import { Clapperboard, Hash, AlignLeft, Sparkles, TrendingUp, BarChart3, Video, Edit2, RefreshCw, Loader2, CheckCircle } from "lucide-react";
import { calculateHookScore } from "@/lib/scoring";

interface CampaignResultProps {
    campaign: Campaign;
    onUpdate?: (campaign: Campaign) => void;
}

interface CardProps {
    children: React.ReactNode;
    title: string;
    icon?: React.ElementType;
    delay?: number;
    className?: string;
}

function Card({ children, title, icon: Icon, delay = 0, className = "" }: CardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay, ease: "easeOut" }}
            className={`glassmorphism rounded-2xl p-6 border border-rosegold shadow-xl relative overflow-hidden group break-inside-avoid mb-8 block ${className}`}
        >
            <div className="absolute top-0 right-0 p-8 scale-150 opacity-5 blur-2xl group-hover:bg-rosegold-gradient transition-all duration-700"></div>

            <div className="flex items-center gap-3 mb-4 relative z-10 border-b border-white/10 pb-4">
                {Icon && <Icon className="w-5 h-5 text-rosegold-500" />}
                <h3 className="text-xl font-bold tracking-wider uppercase text-white/90 font-sans">
                    {title}
                </h3>
            </div>
            <div className="relative z-10 font-light leading-relaxed text-white/80 whitespace-pre-wrap">
                {children}
            </div>
        </motion.div>
    );
}

function HookEditor({ campaign, onUpdate }: { campaign: Campaign, onUpdate?: (c: Campaign) => void }) {
    const [isEditing, setIsEditing] = useState(false);
    const [hookDraft, setHookDraft] = useState(campaign.primaryHook);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [alternatives, setAlternatives] = useState<string[]>([]);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isImproving, setIsImproving] = useState(false);

    const handleSave = () => {
        setIsEditing(false);
        const newScore = calculateHookScore(hookDraft);
        if (onUpdate) {
            onUpdate({ ...campaign, primaryHook: hookDraft, hookIntelligence: newScore });
        }
    };

    const handleImprove = async () => {
        setIsImproving(true);
        setSuggestions([]);
        setAlternatives([]);
        try {
            const res = await fetch("/api/refine", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "hook",
                    topic: campaign.topic,
                    content: campaign.primaryHook,
                    instruction: `Analyze this hook and its scores: Retention ${campaign.hookIntelligence.retention}, Emotion ${campaign.hookIntelligence.emotion}, Curiosity ${campaign.hookIntelligence.curiosity}, Impact ${campaign.hookIntelligence.impact}. Give 3 specific improvements to increase curiosity and emotional intensity. Return strictly a JSON array of strings containing the recommendations. Do not include introductory text.`
                })
            });
            const data = await res.json();
            if (Array.isArray(data.result)) {
                setSuggestions(data.result);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsImproving(false);
        }
    };

    const handleRegenerate = async () => {
        setIsRegenerating(true);
        setAlternatives([]);
        try {
            const res = await fetch("/api/refine", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "hook",
                    topic: campaign.topic,
                    content: campaign.primaryHook,
                    instruction: "Generate 3 alternative high-retention hooks for this topic. Make them more emotionally powerful. Return strictly a JSON array of strings."
                })
            });
            const data = await res.json();
            if (Array.isArray(data.result)) {
                setAlternatives(data.result);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsRegenerating(false);
        }
    };

    return (
        <Card title="Primary Hook" icon={Sparkles} delay={0.2} className="bg-gradient-to-br from-black/60 to-black/80">
            {isEditing ? (
                <div className="space-y-4">
                    <textarea
                        value={hookDraft}
                        onChange={e => setHookDraft(e.target.value)}
                        className="w-full bg-black/40 text-white/90 p-4 rounded-xl focus:outline-none focus:ring-1 focus:ring-rosegold-500/50 border border-white/10 min-h-[100px]"
                    />
                    <div className="flex items-center gap-2">
                        <button onClick={handleSave} className="px-4 py-2 bg-rosegold-500/20 text-rosegold-200 rounded-lg text-sm font-bold uppercase tracking-widest hover:bg-rosegold-500/30 transition-colors flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" /> Save & Re-score
                        </button>
                        <button onClick={() => { setIsEditing(false); setHookDraft(campaign.primaryHook); }} className="px-4 py-2 bg-white/5 text-white/60 rounded-lg text-sm font-bold uppercase tracking-widest hover:bg-white/10 transition-colors">
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-[#e6b8a2] leading-tight">
                        &quot;{campaign.primaryHook}&quot;
                    </div>
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        <CopyButton text={campaign.primaryHook} />
                        <button onClick={() => { setHookDraft(campaign.primaryHook); setIsEditing(true); }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 active:bg-white/5 border border-white/10 text-xs font-semibold text-white/70 transition-colors uppercase tracking-widest">
                            <Edit2 className="w-4 h-4" /> Edit
                        </button>
                        <button onClick={handleRegenerate} disabled={isRegenerating || isImproving} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 hover:bg-rosegold-900/40 active:bg-white/5 border border-white/10 hover:border-rosegold-500/30 text-xs font-semibold text-white/70 hover:text-rosegold-200 transition-colors uppercase tracking-widest disabled:opacity-50">
                            {isRegenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                            Regenerate
                        </button>
                        <button onClick={handleImprove} disabled={isRegenerating || isImproving} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-transparent hover:bg-rosegold-500/10 active:bg-transparent text-[10px] font-semibold text-rosegold-400 hover:text-rosegold-300 transition-colors uppercase tracking-widest disabled:opacity-50 border border-transparent hover:border-rosegold-500/20 ml-auto">
                            {isImproving ? <Loader2 className="w-3 h-3 animate-spin" /> : <TrendingUp className="w-3 h-3" />}
                            Analyze & Improve
                        </button>
                    </div>
                </>
            )}

            {suggestions.length > 0 && !isEditing && (
                <div className="mt-6 space-y-3 pt-6 border-t border-white/5">
                    <p className="text-xs font-bold uppercase tracking-widest text-rosegold-400 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> AI Improvement Strategy
                    </p>
                    <ul className="space-y-2 mt-3">
                        {suggestions.map((sug, i) => (
                            <li key={i} className="text-sm font-medium text-white/80 flex items-start gap-3">
                                <span className="text-rosegold-500 mt-1.5 opacity-50">•</span>
                                <span className="leading-relaxed">{sug}</span>
                            </li>
                        ))}
                    </ul>
                    <button onClick={handleRegenerate} className="mt-4 w-full py-2 bg-rosegold-500/10 hover:bg-rosegold-500/20 text-rosegold-200 text-xs font-bold uppercase tracking-widest rounded-lg transition-colors border border-rosegold-500/20">
                        Apply Strategy (Regenerate Hook)
                    </button>
                </div>
            )}

            {alternatives.length > 0 && !isEditing && (
                <div className="mt-6 space-y-3 pt-6 border-t border-white/5">
                    <p className="text-xs font-bold uppercase tracking-widest text-rosegold-400">Alternative Options</p>
                    {alternatives.map((alt, i) => (
                        <div key={i} className="p-3 bg-white/5 border border-white/5 rounded-lg flex items-start justify-between gap-4 group hover:border-rosegold-500/30 transition-colors">
                            <p className="text-sm font-medium text-white/80">{alt}</p>
                            <button onClick={() => {
                                const newScore = calculateHookScore(alt);
                                if (onUpdate) onUpdate({ ...campaign, primaryHook: alt, hookIntelligence: newScore });
                                setAlternatives([]);
                            }} className="opacity-0 group-hover:opacity-100 px-3 py-1.5 bg-rosegold-500/20 text-rosegold-200 text-xs font-bold uppercase tracking-widest rounded-md hover:bg-rosegold-500/40 transition-all shrink-0">
                                Select & Score
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
}

function TextRefiner({ campaign, onUpdate, title, fieldKey, icon, refineInstruction }: { campaign: Campaign, onUpdate?: (c: Campaign) => void, title: string, fieldKey: keyof Campaign, icon: any, refineInstruction: string }) {
    const [isEditing, setIsEditing] = useState(false);
    const [draft, setDraft] = useState(String(campaign[fieldKey] || ""));
    const [isRefining, setIsRefining] = useState(false);

    const handleSave = () => {
        setIsEditing(false);
        if (onUpdate) {
            onUpdate({ ...campaign, [fieldKey]: draft });
        }
    };

    const handleRefine = async () => {
        setIsRefining(true);
        try {
            const res = await fetch("/api/refine", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "content block",
                    topic: campaign.topic,
                    content: String(campaign[fieldKey] || ""),
                    instruction: refineInstruction
                })
            });
            const data = await res.json();
            if (data.result) {
                setDraft(data.result);
                if (onUpdate) onUpdate({ ...campaign, [fieldKey]: data.result });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsRefining(false);
        }
    };

    const currentText = String(campaign[fieldKey] || "");

    return (
        <Card title={title} icon={icon} delay={0.3}>
            {isEditing ? (
                <div className="space-y-4">
                    <textarea
                        value={draft}
                        onChange={e => setDraft(e.target.value)}
                        className="w-full bg-black/40 text-white/90 p-4 rounded-xl focus:outline-none focus:ring-1 focus:ring-rosegold-500/50 border border-white/10 min-h-[150px] font-mono text-sm"
                    />
                    <div className="flex items-center gap-2">
                        <button onClick={handleSave} className="px-4 py-2 bg-rosegold-500/20 text-rosegold-200 rounded-lg text-sm font-bold uppercase tracking-widest hover:bg-rosegold-500/30 transition-colors flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" /> Save changes
                        </button>
                        <button onClick={() => { setIsEditing(false); setDraft(currentText); }} className="px-4 py-2 bg-white/5 text-white/60 rounded-lg text-sm font-bold uppercase tracking-widest hover:bg-white/10 transition-colors">
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="font-mono text-sm space-y-2 p-4 bg-black/40 rounded-xl border border-white/5 whitespace-pre-wrap leading-relaxed">
                        {currentText}
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                        <CopyButton text={currentText} />
                        <button onClick={() => { setDraft(currentText); setIsEditing(true); }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 active:bg-white/5 border border-white/10 text-xs font-semibold text-white/70 transition-colors uppercase tracking-widest">
                            <Edit2 className="w-4 h-4" /> Edit manually
                        </button>
                        <button onClick={handleRefine} disabled={isRefining} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 hover:bg-rosegold-900/40 active:bg-white/5 border border-white/10 hover:border-rosegold-500/30 text-xs font-semibold text-white/70 hover:text-rosegold-200 transition-colors uppercase tracking-widest disabled:opacity-50 ml-auto">
                            {isRefining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            AI Refine Tone
                        </button>
                    </div>
                </>
            )}
        </Card>
    );
}

export function CampaignResult({ campaign, onUpdate }: CampaignResultProps) {
    const router = useRouter();

    return (
        <div className="w-full space-y-8 animate-in mt-8 pb-32">
            {/* Hook Intelligence Dashboard */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="glassmorphism rounded-3xl p-8 border border-rosegold shadow-[0_0_50px_rgba(230,184,162,0.1)] mb-12"
            >
                <div className="flex flex-col items-center mb-10">
                    <TrendingUp className="w-8 h-8 text-rosegold-400 mb-3" />
                    <h2 className="text-3xl font-extrabold text-rosegold-gradient tracking-widest uppercase text-center">
                        Hook Intelligence Engine
                    </h2>
                    <p className="text-[#ecd2c7]/60 mt-2 tracking-widest text-sm font-semibold uppercase">Real-time Psychological Scoring</p>
                    <div className="mt-4 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                        <p className="text-[10px] text-white/50 uppercase tracking-widest max-w-xl text-center leading-relaxed">
                            <span className="text-rosegold-500 font-bold mr-1">ℹ</span>
                            Scores calculated based on emotional density, curiosity triggers, length optimization, and urgency signals.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-8 place-items-center">
                    <AnimatedCircularProgress score={campaign.hookIntelligence.retention} label="Retention" delay={0.1} />
                    <AnimatedCircularProgress score={campaign.hookIntelligence.emotion} label="Emotion" delay={0.2} />
                    <div className="md:col-span-1 col-span-2 transform scale-125 mb-6 md:mb-0">
                        <AnimatedCircularProgress score={campaign.hookIntelligence.overall} label="Overall" delay={0.3} />
                    </div>
                    <AnimatedCircularProgress score={campaign.hookIntelligence.curiosity} label="Curiosity" delay={0.4} />
                    <AnimatedCircularProgress score={campaign.hookIntelligence.impact} label="Impact" delay={0.5} />
                </div>

                {/* Optimization Suggestion Box */}
                {(campaign.hookIntelligence.curiosity < 75 || campaign.hookIntelligence.emotion < 75 || campaign.hookIntelligence.retention < 75) && (
                    <div className="mt-10 p-4 rounded-xl bg-[#d4a373]/10 border border-[#d4a373]/20 max-w-2xl mx-auto flex items-start gap-4">
                        <span className="text-rosegold-400 mt-0.5 bg-rosegold-500/20 p-1.5 rounded-full"><Sparkles className="w-4 h-4" /></span>
                        <div className="text-sm text-rosegold-200/90 leading-relaxed font-medium">
                            {campaign.hookIntelligence.curiosity < 75 && <p className="mb-1"><span className="font-bold text-white">Curiosity is low.</span> Try introducing an open loop question to drive watch time.</p>}
                            {campaign.hookIntelligence.emotion < 75 && <p className="mb-1"><span className="font-bold text-white">Emotion is low.</span> Consider adding power words or raising the stakes.</p>}
                            {campaign.hookIntelligence.retention < 75 && <p className="mb-0"><span className="font-bold text-white">Retention risk.</span> Make the first 3 seconds punchier and avoid long introductions.</p>}
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Main Campaign Layout (Masonry Grid) */}
            <div className="columns-1 xl:columns-2 gap-8">

                <HookEditor campaign={campaign} onUpdate={onUpdate} />

                <TextRefiner
                    campaign={campaign}
                    onUpdate={onUpdate}
                    title="Cinematic Reel Script"
                    icon={Clapperboard}
                    fieldKey="cinematicReelScript"
                    refineInstruction="Refine the pacing and tone of this script to make it more cinematic and engaging. Output only the revised script."
                />

                {campaign.instagramCaption && (
                    <TextRefiner
                        campaign={campaign}
                        onUpdate={onUpdate}
                        title="Instagram Caption"
                        icon={AlignLeft}
                        fieldKey="instagramCaption"
                        refineInstruction="Make this Instagram caption more engaging and algorithm-friendly. Output only the revised text."
                    />
                )}

                {campaign.twitterCaption && (
                    <TextRefiner
                        campaign={campaign}
                        onUpdate={onUpdate}
                        title="Twitter Strategy"
                        icon={AlignLeft}
                        fieldKey="twitterCaption"
                        refineInstruction="Refine this 280-character Twitter thread/tweet to be punchier and go viral. Output only the revised text."
                    />
                )}

                <Card title="Cinematic Production Blueprint" icon={Video} delay={0.3} className="border-t-4 border-t-[#d4a373]">
                    <div className="space-y-6">

                        {/* Scenes Array Render */}
                        <div className="space-y-4">
                            {(campaign.videoStoryboard.scenes || []).map((scene, i) => (
                                <div key={i} className="p-4 bg-white/5 rounded-lg border border-white/10 group">
                                    <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                                        <span className="text-rosegold-500 font-bold uppercase tracking-widest text-xs">Scene 0{scene.scene}</span>
                                        <span className="text-white/40 font-mono text-xs">{scene.duration}</span>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <span className="block text-rosegold-400 text-[10px] font-bold tracking-wider uppercase mb-1">Visual</span>
                                            <span className="text-sm font-medium text-white/90 leading-tight">{scene.visual}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <span className="block text-rosegold-400/70 text-[10px] font-bold tracking-wider uppercase mb-1">Camera</span>
                                                <span className="text-xs text-white/70">{scene.camera}</span>
                                            </div>
                                            <div>
                                                <span className="block text-rosegold-400/70 text-[10px] font-bold tracking-wider uppercase mb-1">Lighting</span>
                                                <span className="text-xs text-white/70">{scene.lighting}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 bg-white/5 rounded-lg border border-[#b76e79]/30 border-l-4">
                            <span className="block text-rosegold-600 text-xs font-bold tracking-wider mb-1 uppercase">Overlay Text</span>
                            <span className="text-lg font-medium tracking-wide">&quot;{campaign.videoStoryboard.overlayText}&quot;</span>
                        </div>

                        <div className="p-4 bg-black/50 rounded-lg border border-white/5 flex items-center justify-between">
                            <div>
                                <span className="block text-white/50 text-xs font-bold tracking-wider mb-1 uppercase">Call To Action (Ending)</span>
                                <span className="text-sm">{campaign.videoStoryboard.ctaEnding}</span>
                            </div>
                            <CopyButton text={campaign.videoStoryboard.ctaEnding} />
                        </div>

                        {/* Generate Video Button */}
                        <div className="pt-2">
                            <button
                                onClick={() => router.push(`/video?prompt=${encodeURIComponent(campaign.cinematicReelScript)}&ratio=9:16`)}
                                className="w-full py-4 bg-gradient-to-r from-rosegold-500 to-[#d4a373] hover:from-rosegold-400 hover:to-white border border-rosegold-200/50 rounded-xl text-black shadow-[0_0_30px_rgba(230,184,162,0.3)] transition-all flex flex-col items-center justify-center gap-1 group"
                            >
                                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
                                    <Clapperboard className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    Generate Video
                                </div>
                                <span className="text-[10px] font-semibold text-black/70 normal-case tracking-normal pt-1">AI-powered cinematic synthesis. Seamless integration.</span>
                            </button>
                        </div>
                    </div>
                </Card>

                {campaign.linkedInCaption && (
                    <TextRefiner
                        campaign={campaign}
                        onUpdate={onUpdate}
                        title="LinkedIn Strategy"
                        icon={AlignLeft}
                        fieldKey="linkedInCaption"
                        refineInstruction="Make this LinkedIn post more professional, engaging, and authoritative. Output only the revised text."
                    />
                )}

                {campaign.youtubeCaption && (
                    <TextRefiner
                        campaign={campaign}
                        onUpdate={onUpdate}
                        title="YouTube Strategy"
                        icon={AlignLeft}
                        fieldKey="youtubeCaption"
                        refineInstruction="Make this YouTube Short description and headline optimized for maximum CTR. Output only the revised text."
                    />
                )}

                <Card title="Hashtags" icon={Hash} delay={0.6}>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {campaign.hashtags.map((tag: string, i: number) => (
                            <span key={i} className="px-3 py-1 bg-white/5 rounded-md text-sm border border-white/10 hover:border-rosegold-400 cursor-default transition-colors">
                                #{tag.replace('#', '')}
                            </span>
                        ))}
                    </div>
                </Card>

                <Card title="Strategic Advice" icon={BarChart3} delay={0.7}>
                    {campaign.contentStrategyAdvice}
                </Card>

            </div>
        </div>
    );
}
