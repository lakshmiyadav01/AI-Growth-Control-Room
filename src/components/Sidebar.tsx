"use client";

import { useEffect, useState } from "react";
import { Campaign } from "@/lib/types";
import { loadCampaigns, deleteCampaign } from "@/lib/memory";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Trash2, Zap, PlayCircle, FolderOpen, ArrowUpDown, ArrowUpCircle } from "lucide-react";

interface SidebarProps {
    onSelectCallback: (campaign: Campaign) => void;
    refresher: number; // A prop that changes to trigger a reload of campaigns from local storage
}

export function Sidebar({ onSelectCallback, refresher }: SidebarProps) {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [sortBy, setSortBy] = useState<'recent' | 'score'>('recent');

    useEffect(() => {
        const fetchCampaigns = async () => {
            setCampaigns(loadCampaigns());
        };
        fetchCampaigns().catch(console.error);
    }, [refresher]);

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        deleteCampaign(id);
        setCampaigns(loadCampaigns());
    };

    return (
        <div className="w-80 h-screen fixed top-0 left-0 glassmorphism border-r border-[#333] flex flex-col z-40 bg-[#111]/80 backdrop-blur-2xl">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-extrabold uppercase tracking-[0.2em] text-rosegold-100 flex items-center gap-3">
                        <Zap className="w-5 h-5 text-rosegold-500 fill-current" />
                        Control
                    </h1>
                    <p className="text-[#ecd2c7]/50 text-[10px] tracking-[0.3em] font-bold mt-1 uppercase pl-8">
                        Room
                    </p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                <div className="flex items-center justify-between px-2 pb-4 border-b border-white/5 mb-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#ecd2c7]/50">
                        <FolderOpen className="w-4 h-4" /> Memory System
                    </div>
                    {campaigns.length > 0 && (
                        <button
                            onClick={() => setSortBy(prev => prev === 'recent' ? 'score' : 'recent')}
                            className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/80 transition-colors text-[9px] uppercase font-bold tracking-widest border border-white/5"
                        >
                            Sort: {sortBy === 'recent' ? 'Recent' : 'Best'} <ArrowUpDown className="w-3 h-3" />
                        </button>
                    )}
                </div>

                <AnimatePresence>
                    {campaigns.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center p-8 text-white/30 text-sm tracking-widest uppercase font-semibold"
                        >
                            No active protocols
                        </motion.div>
                    ) : (
                        [...campaigns].sort((a, b) =>
                            sortBy === 'score' ? b.hookIntelligence.overall - a.hookIntelligence.overall : 0
                        ).map((c) => {
                            const originalIndex = campaigns.findIndex(orig => orig.id === c.id);
                            const previous = campaigns[originalIndex + 1];
                            const delta = previous ? c.hookIntelligence.overall - previous.hookIntelligence.overall : 0;
                            const isPositive = delta > 0;
                            const isNegative = delta < 0;

                            const highestScore = Math.max(...campaigns.map(camp => camp.hookIntelligence.overall), 0);
                            const isBest = c.hookIntelligence.overall === highestScore && campaigns.length > 1;

                            return (
                                <motion.div
                                    key={c.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    onClick={() => onSelectCallback(c)}
                                    className={`group p-4 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-all flex flex-col relative overflow-hidden border ${isBest ? 'border-rosegold-500/50 shadow-[0_0_15px_rgba(230,184,162,0.1)]' : 'border-white/5 hover:border-rosegold-600/50'}`}
                                >
                                    {isBest && (
                                        <div className="absolute top-0 right-0 p-1.5 bg-rosegold-500/20 rounded-bl-lg border-b border-l border-rosegold-500/30">
                                            <ArrowUpCircle className="w-3 h-3 text-rosegold-400" />
                                        </div>
                                    )}
                                    <div className="absolute inset-y-0 left-0 w-1 bg-rosegold-gradient opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="flex items-start justify-between">
                                        <span className={`text-sm font-semibold truncate mr-6 tracking-wide ${isBest ? 'text-rosegold-200' : 'text-white/90'}`}>
                                            {c.topic}
                                        </span>
                                        <button
                                            onClick={(e) => handleDelete(c.id, e)}
                                            className="text-white/30 hover:text-red-400 transition-colors bg-black/40 p-1.5 rounded-full z-10 opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-4 mt-3 text-[10px] text-rosegold-400 font-bold uppercase tracking-widest">
                                        <span className="flex items-center gap-1 opacity-70 shrink-0">
                                            <Clock className="w-3.5 h-3.5" />
                                            {new Date(c.createdAt).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center justify-between flex-1 relative group/tooltip">
                                            <span className="flex items-center gap-1 text-rosegold-300">
                                                <PlayCircle className="w-3.5 h-3.5 fill-current/20" />
                                                {c.hookIntelligence.overall} / 100
                                            </span>
                                            {delta !== 0 && (
                                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                                    {isPositive ? '↑' : '↓'} {Math.abs(delta)} vs prev
                                                </span>
                                            )}
                                            {/* Tooltip */}
                                            {delta !== 0 && (
                                                <div className="absolute top-full right-0 mt-2 px-2 py-1 bg-black/90 text-white/70 text-[9px] rounded whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none border border-white/10 z-50">
                                                    Change vs last generated campaign
                                                </div>
                                            )}
                                        </span>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>

            <div className="p-6 border-t border-white/5 bg-[#111111]/80">
                <div className="w-full flex flex-col text-[10px] text-white/30 tracking-widest uppercase items-center gap-1 font-semibold">
                    <span>AI Growth Matrix v2.0</span>
                    <span className="opacity-50 text-rosegold-600">Secure Protocol</span>
                </div>
            </div>

            <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 163, 115, 0.5);
        }
      `}</style>
        </div>
    );
}
