"use client";

import { X, Bot, Loader2, CheckCircle2, Mic, Square, ArrowRight, Mail, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";

interface ConsultationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type WizardStep = "record" | "email" | "analysis" | "success";

export function ConsultationModal({ isOpen, onClose }: ConsultationModalProps) {
    const { t, language } = useLanguage();
    const [step, setStep] = useState<WizardStep>("record");
    const [email, setEmail] = useState("");
    const [transcribedText, setTranscribedText] = useState("");
    const [isTranscribing, setIsTranscribing] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset state when opened
    useEffect(() => {
        if (isOpen) {
            setStep("record");
            setEmail("");
            setTranscribedText("");
            setIsSubmitting(false);
        }
    }, [isOpen]);

    const handleRecordingComplete = async (blob: Blob) => {
        setIsTranscribing(true);
        try {
            const formData = new FormData();
            formData.append('file', blob, 'recording.webm');

            const response = await fetch('/api/transcribe', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Transcription failed');

            const data = await response.json();
            if (data.text) {
                setTranscribedText(data.text);
                setStep("email");
            }
        } catch (error) {
            console.error('Error handling recording:', error);
        } finally {
            setIsTranscribing(false);
        }
    };

    const {
        isRecording,
        startRecording,
        stopRecording,
        duration,
        hasPermission
    } = useAudioRecorder({
        onRecordingComplete: handleRecordingComplete,
        maxDuration: 30 // Business analysis shouldn't need >30s intro
    });

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnalyze = async () => {
        if (!email || !transcribedText) return;
        setIsSubmitting(true);

        try {
            const res = await fetch('/api/contact/voice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    message: transcribedText
                })
            });

            if (res.ok) {
                setStep("success");
            } else {
                console.error("Submission failed");
                alert("Something went wrong. Please try again.");
            }
        } catch (error) {
            console.error("Submission error", error);
            alert("Connection failed.");
        } finally {
            setIsSubmitting(false);
        }
    };



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
                        <div className="flex items-center justify-between p-6 border-b border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                                    <Bot className="w-5 h-5 text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="font-display font-bold text-white text-lg">
                                        Voice Consultation
                                    </h3>
                                    <p className="text-xs text-slate-400">Powered by Marian Stancik AI</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 p-8 flex flex-col items-center justify-center relative overflow-hidden">

                            {/* STEP 1: RECORD */}
                            {step === "record" && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="w-full max-w-sm flex flex-col items-center gap-8 text-center"
                                >
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <h2 className="text-2xl font-bold text-white">Describe your challenge</h2>
                                            <p className="text-slate-400">Tell me about your business processes effectively in under 30 seconds.</p>
                                        </div>

                                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 text-left text-sm text-slate-300">
                                            <p className="font-medium text-indigo-400 mb-2">{t.voiceWizard.whatToMention}</p>
                                            <ul className="space-y-1 list-disc list-inside">
                                                <li>{t.voiceWizard.point1}</li>
                                                <li>{t.voiceWizard.point2}</li>
                                                <li>{t.voiceWizard.point3}</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="relative group">
                                        {/* Outer Ring Animation during recording */}
                                        {isRecording && (
                                            <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
                                        )}

                                        <button
                                            onClick={isRecording ? stopRecording : startRecording}
                                            disabled={isTranscribing}
                                            className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${isRecording
                                                ? 'bg-red-500 hover:bg-red-600 shadow-[0_0_40px_-10px_rgba(239,68,68,0.5)]'
                                                : 'bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)]'
                                                } ${isTranscribing ? 'opacity-50 cursor-wait' : ''}`}
                                        >
                                            {isTranscribing ? (
                                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                                            ) : isRecording ? (
                                                <Square className="w-8 h-8 text-white fill-current" />
                                            ) : (
                                                <Mic className="w-10 h-10 text-white" />
                                            )}
                                        </button>
                                    </div>

                                    {isRecording ? (
                                        <div className="space-y-1">
                                            <div className="text-2xl font-mono text-white font-medium">
                                                {formatDuration(duration)} <span className="text-slate-500 text-lg">/ 0:30</span>
                                            </div>
                                            <p className="text-sm text-red-400 animate-pulse">Recording...</p>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500">Click to start recording</p>
                                    )}

                                    {isTranscribing && (
                                        <div className="flex items-center gap-2 text-indigo-400">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Processing audio...</span>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* STEP 2: EMAIL GATE */}
                            {step === "email" && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="w-full max-w-sm flex flex-col gap-6"
                                >
                                    <div className="text-center space-y-2">
                                        <h2 className="text-xl font-bold text-white">One last thing</h2>
                                        <p className="text-slate-400">Where should we send the detailed report?</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Your Message</label>
                                            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-800 text-slate-300 text-sm italic min-h-[80px]">
                                                "{transcribedText}"
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Your Email</label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="name@company.com"
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleAnalyze}
                                            disabled={!email || !email.includes('@') || isSubmitting}
                                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 group"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    <span>Sending...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>Submit Inquiry</span>
                                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                </>
                                            )}
                                        </button>

                                        <button
                                            onClick={() => setStep('record')}
                                            className="w-full py-2 text-slate-500 hover:text-slate-300 text-sm transition-colors"
                                        >
                                            Back to recording
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 3: SUCCESS */}
                            {step === "success" && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="w-full h-full flex flex-col items-center justify-center text-center p-6"
                                >
                                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white mb-2">Thank you!</h2>
                                    <p className="text-slate-400 mb-8 max-w-sm">
                                        We have received your detailed inquiry. Our AI Agent is analyzing it right now and you will receive a report at <span className="text-white font-medium">{email}</span> shortly.
                                    </p>
                                    <button
                                        onClick={onClose}
                                        className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors"
                                    >
                                        Close
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
