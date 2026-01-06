"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, ShieldCheck, Zap, Code2, Lock } from "lucide-react";

const CODE_SNIPPET = `// Generating implementation...
import { Agent } from "@ai-sdk/core";
import { z } from "zod";

export const financialAgent = new Agent({
  role: "Financial Analyst",
  model: "gpt-4-turbo",
  tools: [
    databaseTool,
    stockMarketAPI,
    complianceCheck
  ],
  security: {
    level: "strict",
    audit: true
  }
});

// Deploying to edge...
// Verifying type safety...
// Success.`;

export function VibeCodingSection() {
    const [displayedCode, setDisplayedCode] = useState("");
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        let currentIndex = 0;
        const interval = setInterval(() => {
            if (currentIndex <= CODE_SNIPPET.length) {
                setDisplayedCode(CODE_SNIPPET.slice(0, currentIndex));
                currentIndex++;
            } else {
                clearInterval(interval);
                setIsScanning(true);
            }
        }, 20); // Typing speed

        return () => clearInterval(interval);
    }, []);

    return (
        <section id="metodológia" className="min-h-screen py-24 bg-slate-950 flex items-center relative overflow-hidden text-white">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* Visual: IDE Simulation */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        {/* IDE Window */}
                        <div className="bg-[#1e1e1e] rounded-xl border border-white/10 shadow-2xl overflow-hidden relative z-10 h-[500px] flex flex-col">
                            {/* Toolbar */}
                            <div className="h-10 border-b border-white/5 bg-[#252526] flex items-center px-4 gap-2">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                                </div>
                                <div className="ml-4 text-xs text-slate-500 font-mono">agent-architecture.ts</div>
                            </div>

                            {/* Code Area */}
                            <div className="p-6 font-mono text-sm text-slate-300 relative flex-1">
                                <pre className="whitespace-pre-wrap">
                                    <span className="text-blue-400">const</span> <span className="text-yellow-300">Architecture</span> = <span className="text-purple-400">require</span>(<span className="text-orange-300">'@enterprise/core'</span>);
                                    {"\n\n"}
                                    {displayedCode}
                                    <span className="animate-pulse inline-block w-2 h-4 bg-white ml-1 align-middle"></span>
                                </pre>

                                {/* Architect Scanner Overlay */}
                                {isScanning && (
                                    <motion.div
                                        initial={{ height: "0%" }}
                                        animate={{ height: "100%" }}
                                        transition={{ duration: 2, ease: "linear" }}
                                        className="absolute top-0 left-0 w-full bg-indigo-500/10 border-b-2 border-indigo-500 z-20 pointer-events-none"
                                    />
                                )}

                                {/* Success Badge */}
                                {isScanning && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 2.2 }}
                                        className="absolute bottom-6 right-6 bg-emerald-500/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg backdrop-blur-sm z-30"
                                    >
                                        <ShieldCheck className="w-5 h-5" />
                                        <span className="font-bold text-sm">Type Safe</span>
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        {/* Background Decoration */}
                        <div className="absolute -inset-10 bg-indigo-500/20 blur-3xl -z-10 rounded-full opacity-50" />
                    </motion.div>

                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-purple-500/20 p-2 rounded-lg border border-purple-500/30">
                                <Code2 className="w-6 h-6 text-purple-400" />
                            </div>
                            <span className="text-purple-400 font-mono text-sm tracking-wider uppercase">Metodológia</span>
                        </div>

                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 font-display">
                            Vibe Coding pod <br />
                            <span className="text-indigo-400">architektonickým dozorom</span>
                        </h2>

                        <div className="space-y-8">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                                    <Zap className="w-6 h-6 text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">Multiplikátor produktivity</h3>
                                    <p className="text-slate-400 leading-relaxed">
                                        Využitie prirodzeného jazyka na generovanie kódu ("Vibe Coding") zrýchľuje dodávku o <span className="text-white font-bold">50%</span>.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                                    <Lock className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">Inžinierska disciplína</h3>
                                    <p className="text-slate-400 leading-relaxed">
                                        Architekt garantuje, že výsledok nie je "workslop", ale typovo bezpečný systém na <span className="text-white font-mono">Next.js 16</span>.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 pt-8 border-t border-white/5 grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Stack</div>
                                <div className="text-white font-mono">Next.js • React • TS</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Tools</div>
                                <div className="text-white font-mono">Cursor • Antigravity</div>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
