"use client";

import { motion } from "framer-motion";

interface AnimatedCircularProgressProps {
    score: number;
    label: string;
    delay?: number;
}

export function AnimatedCircularProgress({
    score,
    label,
    delay = 0,
}: AnimatedCircularProgressProps) {
    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative w-24 h-24 flex items-center justify-center">
                <svg
                    className="w-full h-full -rotate-90 transform"
                    viewBox="0 0 100 100"
                >
                    {/* Background circle */}
                    <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="transparent"
                        stroke="rgba(255, 255, 255, 0.05)"
                        strokeWidth="8"
                    />
                    {/* Foreground progress circle */}
                    <motion.circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="transparent"
                        stroke="url(#rosegold-gradient)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.5, delay, ease: "easeOut" }}
                    />
                    <defs>
                        <linearGradient id="rosegold-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#d4a373" />
                            <stop offset="50%" stopColor="#e6b8a2" />
                            <stop offset="100%" stopColor="#b76e79" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Center text score */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: delay + 0.5 }}
                    className="absolute text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#d4a373] to-[#b76e79]"
                >
                    {score}
                </motion.div>
            </div>
            <p className="text-xs uppercase tracking-widest text-[#e6b8a2] font-semibold text-center whitespace-nowrap">
                {label}
            </p>
        </div>
    );
}
