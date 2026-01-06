"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Search, ShoppingCart, ShieldAlert, BadgeEuro, CloudLightning, ArrowUpRight, LucideIcon } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

type UseCase = {
    id: string;
    title: string;
    icon: LucideIcon;
    desc: string;
    roi: string;
    color: string;
};

export function UseCasesSection() {
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const { t } = useLanguage();

    const USE_CASES: UseCase[] = [
        {
            id: "market",
            title: t.useCases.items.market.title,
            icon: Search,
            desc: t.useCases.items.market.desc,
            roi: t.useCases.items.market.roi,
            color: "bg-blue-500"
        },
        {
            id: "supply",
            title: t.useCases.items.supply.title,
            icon: ShoppingCart,
            desc: t.useCases.items.supply.desc,
            roi: t.useCases.items.supply.roi,
            color: "bg-orange-500"
        },
        {
            id: "compliance",
            title: t.useCases.items.compliance.title,
            icon: ShieldAlert,
            desc: t.useCases.items.compliance.desc,
            roi: t.useCases.items.compliance.roi,
            color: "bg-red-500"
        },
        {
            id: "finance",
            title: t.useCases.items.finance.title,
            icon: BadgeEuro,
            desc: t.useCases.items.finance.desc,
            roi: t.useCases.items.finance.roi,
            color: "bg-emerald-500"
        },
        {
            id: "finops",
            title: t.useCases.items.finops.title,
            icon: CloudLightning,
            desc: t.useCases.items.finops.desc,
            roi: t.useCases.items.finops.roi,
            color: "bg-purple-500"
        }
    ];

    return (
        <section id="use-cases" className="py-24 bg-slate-950 relative">
            <div className="container mx-auto px-4">

                <div className="mb-16 text-center">
                    <h2 className="text-4xl font-bold text-white mb-4 font-display">
                        {t.useCases.title.split("Use")[0]} <span className="text-indigo-500">{t.useCases.title.match(/Use.*$/) || "Use Casov"}</span>
                        {/* A bit hacky splitting, but valid since sk/en structure is similar "5 Key Use Cases". 
                            Better: just render title and colorize manualy or keep simple. 
                            Let's keep it simple for now or rely on specific formatting if needed.
                            Actually, t.useCases.title is "5 Kľúčových Use Casov", so splitting works.
                        */}
                    </h2>
                    <p className="text-slate-400">
                        {t.useCases.subtitle}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {USE_CASES.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            onHoverStart={() => setHoveredId(item.id)}
                            onHoverEnd={() => setHoveredId(null)}
                            className="group relative h-[300px] rounded-2xl bg-white/5 border border-white/10 overflow-hidden cursor-pointer"
                        >
                            {/* Background Gradient */}
                            <div className={cn(
                                "absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500",
                                item.color
                            )} />

                            <div className="p-6 h-full flex flex-col relative z-10">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-6">
                                    <div className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg",
                                        item.color
                                    )}>
                                        <item.icon className="w-6 h-6" />
                                    </div>
                                    <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
                                </div>

                                {/* Title */}
                                <h3 className="text-xl font-bold text-white mb-2 font-display">{item.title}</h3>

                                {/* Desc (Visible by default) */}
                                <p className="text-sm text-slate-400 group-hover:text-white/90 transition-colors">
                                    {item.desc}
                                </p>

                                {/* ROI (Slide Up on Hover) */}
                                <div className="mt-auto overflow-hidden">
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{
                                            y: hoveredId === item.id ? 0 : 20,
                                            opacity: hoveredId === item.id ? 1 : 0
                                        }}
                                        className="pt-4 border-t border-white/10"
                                    >
                                        <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">{t.useCases.benefitLabel}</div>
                                        <div className={cn("text-2xl font-bold font-mono", item.color.replace("bg-", "text-"))}>
                                            {item.roi}
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
}
