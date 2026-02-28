"use client";

import { useState, useRef, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { CommandCenter } from "@/components/CommandCenter";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Efficiency: dynamically import heavy results component
const CampaignResult = dynamic(() => import("@/components/CampaignResult").then(m => m.CampaignResult), {
  loading: () => (
    <div className="flex flex-col items-center justify-center p-24 text-rosegold-500">
      <Loader2 className="w-8 h-8 animate-spin mb-4" />
      <p className="text-sm tracking-widest uppercase font-bold">Rendering Analysis Dashboard...</p>
    </div>
  ),
  ssr: false
});
import { Campaign } from "@/lib/types";
import { saveCampaign } from "@/lib/memory";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [refresher, setRefresher] = useState(0);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleCampaignGenerated = useCallback((campaign: Campaign) => {
    saveCampaign(campaign);
    setRefresher((prev) => prev + 1);
    setActiveCampaign(campaign);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }, []);

  const handleUpdateCampaign = useCallback((campaign: Campaign) => {
    saveCampaign(campaign);
    setActiveCampaign(campaign);
    setRefresher((prev) => prev + 1);
  }, []);

  const handleSelectCampaign = useCallback((campaign: Campaign) => {
    setActiveCampaign(campaign);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }, []);

  return (
    <div className="flex bg-[#111111] min-h-screen text-white relative font-sans overflow-hidden">
      {/* Background cinematic effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-rosegold-900/10 rounded-full blur-[120px] mix-blend-screen opacity-50 translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#d4a373] rounded-full blur-[150px] mix-blend-screen opacity-5 -translate-x-1/3 translate-y-1/3"></div>
      </div>

      <Sidebar onSelectCallback={handleSelectCampaign} refresher={refresher} />

      <main className="flex-1 ml-80 relative z-10 px-8 py-12 lg:px-16 overflow-y-auto h-screen">
        <header className="max-w-6xl mx-auto mb-16 relative">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center justify-center text-center space-y-4 pt-12"
          >
            <div className="inline-block relative">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-r from-white via-rosegold-100 to-white pb-2 px-10">
                AI Growth <br /> <span className="text-rosegold-gradient">Control Room</span>
              </h2>
              <div className="absolute -inset-1 opacity-20 blur-xl bg-gradient-to-r from-transparent via-rosegold-500 to-transparent mix-blend-screen z-[-1]"></div>
            </div>
            <p className="text-rosegold-200/60 font-medium tracking-[0.3em] uppercase text-sm -mt-2">
              Premium AI-Powered Creative Studio
            </p>
          </motion.div>
        </header>

        <div className="max-w-6xl mx-auto space-y-16">
          <CommandCenter onGenerated={handleCampaignGenerated} />

          <AnimatePresence mode="popLayout">
            {activeCampaign && (
              <motion.div
                ref={resultsRef}
                key={activeCampaign.id}
                initial={{ opacity: 0, scale: 0.98, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -40 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="flex items-center justify-between mb-8 border-b border-rosegold-900/50 pb-6 px-4">
                  <div>
                    <h3 className="text-2xl font-bold tracking-widest text-rosegold-200 uppercase flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-rosegold-500 animate-pulse"></div>
                      Performance Summary
                    </h3>
                    <div className="flex items-center gap-6 mt-3 ml-5">
                      <p className="text-sm font-semibold text-white/50 uppercase tracking-widest flex items-center gap-2">
                        <span className="text-white/30">Overall Score:</span> <span className="text-rosegold-400">{activeCampaign.hookIntelligence.overall}</span>
                      </p>
                      <p className="text-sm font-semibold text-white/50 uppercase tracking-widest flex items-center gap-2">
                        <span className="text-white/30">Platform:</span> <span className="text-white/80">{activeCampaign.platform || "Instagram"}</span>
                      </p>
                      <p className="text-sm font-semibold text-white/50 uppercase tracking-widest flex items-center gap-2">
                        <span className="text-white/30">Target:</span> <span className="text-white/80">{activeCampaign.targetAudience || "Creators"}</span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveCampaign(null)}
                    className="text-xs uppercase font-bold tracking-widest px-4 py-2 border border-white/10 hover:border-white/30 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all"
                  >
                    Clear Dashboard
                  </button>
                </div>

                <CampaignResult campaign={activeCampaign} onUpdate={handleUpdateCampaign} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
