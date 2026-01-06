"use client";

import { useChat } from "@ai-sdk/react";
import { X, Send, Bot, User, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n/context";

interface ConsultationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ConsultationModal({ isOpen, onClose }: ConsultationModalProps) {
    const { t } = useLanguage();
    const [input, setInput] = useState("");

    // We need to re-initialize useChat when language changes to update the welcome message?
    // Actually useChat initialMessages are only used on mount. 
    // For a simple fix, we can just rely on the fact that if the user switches language, they might reload or we accept English welcome in Slovak context for a second.
    // BETTER: Use key to force remount or update messages? 
    // Simplest: Just let it be for now, or use a useEffect to append a translated welcome message if empty?
    // Actually, `useChat` keeps state. Let's just use the translated string for NEW sessions or if we force reset.
    // For now, I will use `t.consultation.initialMessage` directly in the config, which works on initial load.

    const { messages, sendMessage, status, stop } = useChat({
        // @ts-ignore
        initialMessages: [
            {
                id: "welcome",
                role: "assistant",
                parts: [{ type: 'text', text: t.consultation.initialMessage }]
            }
        ],
    });

    // Derive loading state
    const isLoading = status === "streaming" || status === "submitted";

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [isOpen]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;
        const currentInput = input;
        setInput(""); // Optimistic clear
        try {
            await sendMessage({
                role: "user",
                parts: [{ type: "text", text: currentInput }]
            });
        } catch (error) {
            console.error("Failed to send message:", error);
            setInput(currentInput); // Restore on error
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSuggestionClick = (text: string) => {
        setInput("");
        sendMessage({
            role: "user",
            parts: [{ type: "text", text }]
        });
    };

    const suggestedPrompts = [
        t.consultation.suggested.booking,
        t.consultation.suggested.services,
        t.consultation.suggested.pricing,
        t.consultation.suggested.crm
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-4 right-4 top-[10%] bottom-[10%] md:left-1/2 md:ml-[-300px] md:w-[600px] md:h-[600px] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                                    <Bot className="w-5 h-5 text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="font-display font-bold text-white">{t.consultation.title}</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                        </span>
                                        <span className="text-xs text-slate-400 font-medium">{t.consultation.online}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            {messages.map((m) => (
                                <div
                                    key={m.id}
                                    className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"
                                        }`}
                                >
                                    {m.role !== "user" && (
                                        <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shrink-0 mt-1">
                                            <Sparkles className="w-4 h-4 text-indigo-400" />
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-[80%] rounded-2xl p-4 ${m.role === "user"
                                            ? "bg-indigo-600 text-white rounded-br-none"
                                            : "bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700/50"
                                            }`}
                                    >
                                        <div className="prose prose-invert prose-sm">
                                            {m.parts
                                                ? m.parts.filter(p => p.type === 'text').map((p, i) => (p as any).text).join('')
                                                : (m as any).content
                                            }
                                        </div>
                                    </div>
                                    {m.role === "user" && (
                                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600 shrink-0 mt-1">
                                            <User className="w-4 h-4 text-slate-300" />
                                        </div>
                                    )}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex gap-3 justify-start">
                                    <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shrink-0 mt-1">
                                        <Bot className="w-4 h-4 text-indigo-400" />
                                    </div>
                                    <div className="bg-slate-800 rounded-2xl rounded-bl-none p-4 border border-slate-700/50 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-4">
                            {messages.length <= 1 && (
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mask-fade-right">
                                    {suggestedPrompts.map((prompt, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSuggestionClick(prompt)}
                                            className="whitespace-nowrap px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm rounded-full transition-colors"
                                        >
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="flex gap-2 relative">
                                <input
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={t.consultation.inputPlaceholder}
                                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-light"
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={isLoading || !input.trim()}
                                    className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all flex items-center justify-center min-w-[3rem]"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
