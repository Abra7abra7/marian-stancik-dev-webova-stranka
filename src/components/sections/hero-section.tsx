"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";

function Counter({
    from,
    to,
    duration = 2,
    suffix = "",
    className,
}: {
    from: number;
    to: number;
    duration?: number;
    suffix?: string;
    className?: string;
}) {
    const [count, setCount] = useState(from);

    useEffect(() => {
        let start = from;
        const end = to;
        const totalFrames = duration * 60;
        const increment = (end - from) / totalFrames;
        let currentFrame = 0;

        const timer = setInterval(() => {
            currentFrame++;
            start += increment;
            if (currentFrame >= totalFrames) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.round(start));
            }
        }, 1000 / 60);

        return () => clearInterval(timer);
    }, [from, to, duration]);

    return <span className={className}>{count}{suffix}</span>;
}

export function HeroSection() {
    const { scrollY } = useScroll();
    const y = useTransform(scrollY, [0, 500], [0, 200]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);
    const { t } = useLanguage();

    return (
        <section className="relative min-h-screen md:h-screen w-full flex items-center justify-center overflow-hidden bg-slate-950 pt-32 pb-12 md:py-0">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50"></div>

            <motion.div
                style={{ y, opacity }}
                className="relative z-10 container mx-auto px-4 text-center"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="mb-4 md:mb-6 relative inline-block"
                >
                    <h1 className="text-[60px] md:text-[180px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-800 font-display select-none">
                        2026
                    </h1>
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white to-slate-800 opacity-20 blur-3xl -z-10 animate-pulse"></div>
                </motion.div>

                <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="text-3xl md:text-6xl font-bold text-white mb-4 md:mb-6 font-display tracking-tight"
                >
                    {t.hero.label}
                </motion.h2>

                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.8 }}
                    className="text-lg md:text-2xl text-slate-400 max-w-2xl mx-auto mb-10 md:mb-16 font-light"
                >
                    {t.hero.description}
                </motion.p>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
                    <motion.div
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 1.0 }}
                        className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
                    >
                        <div className="text-4xl font-bold text-indigo-400 font-mono mb-2">
                            <Counter from={0} to={56} suffix="%" />
                        </div>
                        <p className="text-sm text-slate-400">{t.hero.stats.leaders}</p>
                    </motion.div>

                    <motion.div
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 1.2 }}
                        className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 backdrop-blur-sm"
                    >
                        <div className="text-4xl font-bold text-red-400 font-mono mb-2">
                            <Counter from={0} to={78} suffix="%" />
                        </div>
                        <p className="text-sm text-red-200/70">{t.hero.stats.integration}</p>
                    </motion.div>

                    <motion.div
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 1.4 }}
                        className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-indigo-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                        <div className="relative z-10">
                            <div className="text-4xl font-bold text-white font-mono mb-2">
                                NxM
                            </div>
                            <p className="text-sm text-slate-400">{t.hero.stats.api}</p>
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2, duration: 1 }}
                    className="mt-8 md:mt-12 text-sm text-slate-500 font-mono uppercase tracking-widest"
                >
                    {t.hero.scroll}
                </motion.div>
            </motion.div>
        </section>
    );
}
