import { Navbar } from "@/components/ui/navbar";
import { HeroSection } from "@/components/sections/hero-section";
import { AgenticSection } from "@/components/sections/agentic-section";
import { VibeCodingSection } from "@/components/sections/vibe-coding-section";
import { UseCasesSection } from "@/components/sections/use-cases-section";
import { SecuritySection } from "@/components/sections/security-section";
import { RoadmapSection } from "@/components/sections/roadmap-section";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 selection:bg-indigo-500/30">
      <Navbar />
      <HeroSection />
      <AgenticSection />
      <VibeCodingSection />
      <UseCasesSection />
      <SecuritySection />
      <RoadmapSection />
    </main>
  );
}
