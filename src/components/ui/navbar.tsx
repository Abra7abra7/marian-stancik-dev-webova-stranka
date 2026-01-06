"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function Navbar() {
    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md border-b border-white/5 bg-slate-950/50"
        >
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center">
                    <span className="text-white font-bold text-lg font-display">A</span>
                </div>
                <span className="text-slate-100 font-bold font-display tracking-wide">
                    Industrial AI
                </span>
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

            <button className="px-4 py-2 text-xs font-medium text-slate-950 bg-white hover:bg-slate-200 rounded-full transition-colors font-mono uppercase tracking-wider">
                Rezervovať konzultáciu
            </button>
        </motion.header>
    );
}
