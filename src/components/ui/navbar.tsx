"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <motion.header
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md border-b border-white/5 bg-slate-950/80"
            >
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center">
                        <span className="text-white font-bold text-sm font-display tracking-widest">MS</span>
                    </div>
                </div>

                <nav className="hidden md:flex items-center gap-8">
                    {["Koncept", "Metodológia", "Use Cases", "Bezpečnosť", "Plán"].map(
                        (item, i) => (
                            <Link
                                key={item}
                                href={`#${item.toLowerCase().replace(" ", "-")}`}
                                className="text-sm text-slate-400 hover:text-white transition-colors font-medium"
                            >
                                {item}
                            </Link>
                        )
                    )}
                </nav>

                <div className="hidden md:block">
                    <button className="px-4 py-2 text-xs font-medium text-slate-950 bg-white hover:bg-slate-200 rounded-full transition-colors font-mono uppercase tracking-wider">
                        Rezervovať konzultáciu
                    </button>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden text-white p-2"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X /> : <Menu />}
                </button>
            </motion.header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-40 bg-slate-950 pt-24 px-6 md:hidden flex flex-col items-center gap-8"
                    >
                        <nav className="flex flex-col items-center gap-6">
                            {["Koncept", "Metodológia", "Use Cases", "Bezpečnosť", "Plán"].map(
                                (item) => (
                                    <Link
                                        key={item}
                                        href={`#${item.toLowerCase().replace(" ", "-")}`}
                                        onClick={() => setIsOpen(false)}
                                        className="text-2xl text-slate-300 hover:text-white transition-colors font-medium font-display"
                                    >
                                        {item}
                                    </Link>
                                )
                            )}
                        </nav>

                        <button className="px-8 py-3 text-sm font-bold text-slate-950 bg-white hover:bg-slate-200 rounded-full transition-colors font-mono uppercase tracking-wider">
                            Rezervovať konzultáciu
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
