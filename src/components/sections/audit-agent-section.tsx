"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Sparkles, Globe, Mail, AlertCircle, Check } from "lucide-react";
import { analyzeWebsite } from "@/app/actions";
import { useLanguage } from "@/lib/i18n/context";

export function AuditAgentSection() {
    const { t } = useLanguage();
    const [step, setStep] = useState<"input" | "analyzing" | "results">("input");
    const [formData, setFormData] = useState({
        url: "",
        email: "",
    });
    const [result, setResult] = useState<{ score: number; teaser: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.url || !formData.email) return;

        setStep("analyzing");
        setError(null);

        // Create FormData for Server Action
        const data = new FormData();
        data.append("url", formData.url);
        data.append("email", formData.email);

        try {
            const response = await analyzeWebsite(data);

            if (response.success && response.score) {
                setResult({ score: response.score, teaser: response.teaser || "" });
                setStep("results");
            } else {
                setError(response.error || t.audit.errors.generic);
                setStep("input");
            }
        } catch (err) {
            console.error(err);
            setError(t.audit.errors.connection);
            setStep("input");
        }
    };

    return (
        <section className="py-24 bg-slate-950 relative overflow-hidden" id="audit">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-1/3 h-full bg-purple-500/5 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* Left Side: Copy */}
                    <div className="text-left space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono uppercase tracking-wider">
                            <Sparkles className="w-3 h-3" />
                            <span>{t.audit.label}</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-white font-display leading-tight">
                            {t.audit.title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{t.audit.titleHighlight}</span>
                        </h2>
                        <p className="text-slate-400 text-lg max-w-lg leading-relaxed font-light">
                            {t.audit.description}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-slate-500 font-mono pt-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span>Gemini Pro Connected</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Interactive Agent Card */}
                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-20 blur-lg"></div>
                        <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-8 min-h-[420px] flex flex-col shadow-2xl overflow-hidden">

                            {/* Header */}
                            <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                        <Bot className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <div>
                                        <div className="text-white font-bold font-display">Web Auditor</div>
                                        <div className="text-xs text-indigo-400">Powered by Gemini</div>
                                    </div>
                                </div>
                            </div>

                            {/* Main Content */}
                            <div className="flex-1 flex flex-col justify-center">
                                <AnimatePresence mode="wait">

                                    {/* STEP 1: Input */}
                                    {step === "input" && (
                                        <motion.form
                                            key="input"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            onSubmit={handleSubmit}
                                            className="space-y-4"
                                        >
                                            {error && (
                                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200 text-sm flex items-center gap-2">
                                                    <AlertCircle className="w-4 h-4" />
                                                    {error}
                                                </div>
                                            )}

                                            <div className="space-y-2">
                                                <label className="text-sm text-slate-400 font-medium ml-1">{t.audit.inputUrl}</label>
                                                <div className="relative">
                                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                                    <input
                                                        type="text"
                                                        placeholder={t.audit.placeholders.url}
                                                        value={formData.url}
                                                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-600 font-light"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm text-slate-400 font-medium ml-1">{t.audit.inputEmail}</label>
                                                <div className="relative">
                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                                    <input
                                                        type="email"
                                                        placeholder={t.audit.placeholders.email}
                                                        value={formData.email}
                                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-600 font-light"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                type="submit"
                                                className="w-full mt-4 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2 group"
                                            >
                                                <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                                                {t.audit.startAudit}
                                            </button>
                                        </motion.form>
                                    )}

                                    {/* STEP 2: Analyzing */}
                                    {step === "analyzing" && (
                                        <motion.div
                                            key="analyzing"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="flex flex-col items-center justify-center space-y-6 text-center py-8"
                                        >
                                            <div className="relative">
                                                <div className="w-20 h-20 rounded-full border-4 border-slate-800 border-t-indigo-500 animate-spin"></div>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Bot className="w-8 h-8 text-indigo-400" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-white font-medium text-xl">{t.audit.analyzing.title.replace("{url}", formData.url)}</h3>
                                                <div className="flex flex-col gap-1 text-sm text-slate-500 font-mono">
                                                    {t.audit.analyzing.steps.map((step, i) => (
                                                        <span key={i} className={i === 0 ? "" : i === 1 ? "animate-pulse delay-75" : "animate-pulse delay-150"}>{step}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* STEP 3: Results */}
                                    {step === "results" && result && (
                                        <motion.div
                                            key="results"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="space-y-6 text-center"
                                        >
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-wider">
                                                <Check className="w-3 h-3" />
                                                {t.audit.results.badge}
                                            </div>

                                            <div className="p-6 bg-slate-800/30 rounded-2xl border border-white/5">
                                                <p className="text-slate-400 text-sm mb-2 font-mono">{t.audit.results.scoreLabel}</p>
                                                <div className="text-6xl font-black text-white font-display mb-1 flex items-center justify-center gap-2">
                                                    {result.score}<span className="text-2xl text-slate-600 block mt-4">/100</span>
                                                </div>
                                            </div>

                                            <div className="text-left space-y-2 bg-indigo-500/5 p-4 rounded-xl border border-indigo-500/10">
                                                <p className="text-xs text-indigo-300 uppercase font-bold tracking-wider">{t.audit.results.opportunityLabel}</p>
                                                <p className="text-slate-200 font-medium leading-relaxed">
                                                    {result.teaser}
                                                </p>
                                            </div>

                                            <div className="pt-4 border-t border-slate-800">
                                                <p className="text-slate-400 text-sm mb-4">
                                                    {t.audit.results.emailSent} <strong>{formData.email}</strong>
                                                </p>
                                                <button
                                                    onClick={() => setStep("input")}
                                                    className="text-sm text-indigo-400 hover:text-white transition-colors"
                                                >
                                                    {t.audit.results.retry}
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}

                                </AnimatePresence>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
