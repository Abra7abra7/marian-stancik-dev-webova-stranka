"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { MessageSquare, Network, Database, Mail, Server, ArrowRight } from "lucide-react";

export function AgenticSection() {
    const [mode, setMode] = useState<"chat" | "agent">("chat");

    return (
        <section id="koncept" className="min-h-screen py-24 bg-slate-950 flex items-center relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-display">
                            Agentic-as-a-Service <span className="text-indigo-500">(AAaaS)</span>
                        </h2>
                        <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                            Prechod od reaktívneho <span className="text-white font-medium">Chat AI</span> k proaktívnemu <span className="text-indigo-400 font-medium">Agentic AI</span>.
                        </p>

                        <ul className="space-y-4 mb-10">
                            {[
                                { title: "Autonómia", desc: "Agenti konajú samostatne, nie sú len nástroje." },
                                { title: "Event-driven", desc: "Reagujú na udalosti v reálnom čase (ceny, logy)." },
                                { title: "Proaktivita", desc: "Nečakajú na prompt. Riešia problémy skôr, než vzniknú." }
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 mt-1">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-medium">{item.title}</h4>
                                        <p className="text-sm text-slate-500">{item.desc}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 inline-block">
                            <p className="text-emerald-400 text-sm font-mono">
                                Prediction 2026: 40% enterprise apps will use agents.
                            </p>
                        </div>
                    </motion.div>

                    {/* Interactive Visual */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="bg-slate-900 rounded-3xl p-8 border border-white/5 relative"
                    >
                        {/* Toggle Switch */}
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-slate-800 p-1 rounded-full flex items-center gap-2 z-20">
                            <button
                                onClick={() => setMode("chat")}
                                className={cn(
                                    "px-6 py-2 rounded-full text-sm font-medium transition-all duration-300",
                                    mode === "chat" ? "bg-white text-slate-950 shadow-lg" : "text-slate-400 hover:text-white"
                                )}
                            >
                                2023: Chat AI
                            </button>
                            <button
                                onClick={() => setMode("agent")}
                                className={cn(
                                    "px-6 py-2 rounded-full text-sm font-medium transition-all duration-300",
                                    mode === "agent" ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25" : "text-slate-400 hover:text-white"
                                )}
                            >
                                2026: Agentic AI
                            </button>
                        </div>

                        {/* Visualization Container */}
                        <div className="h-[400px] mt-16 relative flex items-center justify-center">

                            {mode === "chat" ? (
                                <motion.div
                                    key="chat-view"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col items-center gap-6"
                                >
                                    <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                        <MessageSquare className="w-10 h-10 text-slate-500" />
                                    </div>
                                    <div className="w-64 h-12 bg-white/5 rounded-lg animate-pulse" />
                                    <div className="w-48 h-12 bg-white/5 rounded-lg animate-pulse delay-100" />
                                    <p className="text-slate-500 text-sm mt-4">Waiting for user input...</p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="agent-view"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="relative w-full h-full"
                                >
                                    {/* Central Brain */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                                        <div className="w-24 h-24 rounded-full bg-indigo-500/20 flex items-center justify-center relative">
                                            <div className="absolute inset-0 border border-indigo-500 rounded-full animate-ping opacity-20" />
                                            <Network className="w-10 h-10 text-indigo-400" />
                                        </div>
                                    </div>

                                    {/* Orbital Nodes - Clean */}
                                    <NodeOrbit icon={<Database className="w-5 h-5 text-white" />} color="bg-blue-500" delay={0} />
                                    <NodeOrbit icon={<Mail className="w-5 h-5 text-white" />} color="bg-emerald-500" delay={-2.6} />
                                    <NodeOrbit icon={<Server className="w-5 h-5 text-white" />} color="bg-purple-500" delay={-5.3} />

                                </motion.div>
                            )}

                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}

function NodeOrbit({ icon, color, delay }: { icon: any, color: string, delay: number }) {
    return (
        <motion.div
            className="absolute top-1/2 left-1/2 w-0 h-0"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear", delay: delay }}
        >
            <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2" style={{ transform: "translate(130px)" }}>
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear", delay: delay }}
                    className={cn("w-12 h-12 rounded-xl flex items-center justify-center shadow-lg border border-white/20", color)}
                >
                    {icon}
                </motion.div>
            </div>
            <div className="absolute top-0 left-0 w-[130px] h-[1px] bg-gradient-to-l from-indigo-500/50 to-transparent origin-left" />
        </motion.div>
    );
}
