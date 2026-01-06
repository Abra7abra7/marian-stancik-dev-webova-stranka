"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Calendar, UserCheck, Rocket } from "lucide-react";

const STEPS = [
    {
        id: 1,
        title: "AI Audit",
        duration: "1-2 Týždne",
        desc: "Identifikácia 'Low Hanging Fruit' a kvality dát.",
        icon: CheckCircle2,
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20"
    },
    {
        id: 2,
        title: "Pilot PoC",
        duration: "2-4 Týždne",
        desc: "Rýchly funkčný prototyp pod vedením architekta.",
        icon: Rocket,
        color: "text-indigo-400",
        bg: "bg-indigo-500/10",
        border: "border-indigo-500/20"
    },
    {
        id: 3,
        title: "Production Hardening",
        duration: "1-2 Mesiace",
        desc: "Enterprise riešenie (TypeScript, RAG pipeline, SOC2).",
        icon: UserCheck,
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20"
    }
];

export function RoadmapSection() {
    return (
        <section id="plán" className="py-24 bg-slate-950 relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">

                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-display">
                        Implementačný Plán
                    </h2>
                    <p className="text-slate-400">Merateľné výsledky v horizonte týždňov, nie rokov.</p>
                </div>

                <div className="max-w-4xl mx-auto relative">
                    {/* Connecting Line */}
                    <div className="absolute left-[27px] top-8 bottom-8 w-0.5 bg-gradient-to-b from-blue-500 via-indigo-500 to-emerald-500 opacity-30 md:left-1/2 md:-translate-x-1/2" />

                    <div className="space-y-12">
                        {STEPS.map((step, index) => (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2 }}
                                className={`flex flex-col md:flex-row gap-8 items-start md:items-center ${index % 2 === 0 ? 'md:flex-row-reverse text-left md:text-right' : ''}`}
                            >
                                {/* Icon Node */}
                                <div className="absolute left-0 md:left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center z-10 shadow-xl">
                                    <step.icon className={`w-6 h-6 ${step.color}`} />
                                </div>

                                {/* Content Card */}
                                <div className="ml-16 md:ml-0 md:w-1/2 px-4 md:px-12">
                                    <div className={`p-6 rounded-2xl border ${step.border} ${step.bg} backdrop-blur-sm hover:border-white/20 transition-colors`}>
                                        <div className={`flex items-center gap-2 mb-2 ${index % 2 === 0 ? 'md:justify-end' : ''}`}>
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            <span className="text-sm font-mono text-slate-300">{step.duration}</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                                        <p className="text-slate-400 text-sm">{step.desc}</p>
                                    </div>
                                </div>

                                {/* Empty space for the other side */}
                                <div className="hidden md:block md:w-1/2" />
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* CTA / Conclusion */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-32 max-w-2xl mx-auto text-center"
                >
                    <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-900 border border-white/10 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-indigo-500/5 group-hover:bg-indigo-500/10 transition-colors" />

                        <h3 className="text-2xl font-bold text-white mb-4 relative z-10">
                            Frakčný Architekt
                        </h3>
                        <p className="text-slate-400 mb-8 relative z-10">
                            Flexibilná expertíza seniorného architekta za zlomok ceny full-time zamestnanca.
                        </p>

                        <button className="bg-white text-slate-950 px-8 py-3 rounded-full font-bold hover:bg-slate-200 transition-colors inline-flex items-center gap-2 group-hover:scale-105 transition-transform">
                            Postaviť infraštruktúru
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    <p className="mt-12 text-slate-500 text-sm italic">
                        "V roku 2026 nerozhoduje kvalita AI modelu, ale kvalita architektúry, ktorá ho obklopuje."
                    </p>
                </motion.div>

                {/* Simple Footer */}
                <footer className="mt-32 border-t border-white/5 pt-8 pb-8 text-center text-slate-600 text-sm">
                    <p>&copy; 2026 Industrial AI Solutions. Built with Next.js 16 + React Flow.</p>
                </footer>

            </div>
        </section>
    );
}
