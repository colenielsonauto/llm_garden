"use client";

import React, { forwardRef, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AnimatedBeam } from "@/components/ui/animated-beam";
import { GradientButton } from "@/components/ui/gradient-button";
import { Box } from "lucide-react"; // Keep Box for main logo
// Import Lobe Icons
import { 
    Grok, 
    OpenAI, 
    Gemini, 
    Anthropic, 
    Meta, 
    DeepSeek
} from "@lobehub/icons";

// Simplified Circle component
const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "z-10 flex size-12 items-center justify-center rounded-full border-2 border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-3 shadow-md",
        className, 
      )}
    >
      {children}
    </div>
  );
});

Circle.displayName = "Circle";

// Use Lobe Icons
const Icons = {
  grok: () => <Grok size={24} />, 
  openai: () => <OpenAI size={24} />, 
  gemini: () => <Gemini size={24} />, 
  anthropic: () => <Anthropic size={24} />, 
  meta: () => <Meta size={24} />, 
  deepseek: () => <DeepSeek size={24} />,
  // Central Logo - Still using Box, or replace with a Lobe Icon if appropriate
  aiGarden: () => <Box size={32} className="text-[#ad4f11]" />, 
};

function AnimatedBeamSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  // Assign specific icons to refs
  const refGrok = useRef<HTMLDivElement>(null); 
  const refOpenAI = useRef<HTMLDivElement>(null); 
  const refGemini = useRef<HTMLDivElement>(null); 
  const refAnthropic = useRef<HTMLDivElement>(null); 
  const refMeta = useRef<HTMLDivElement>(null); 
  const refCenter = useRef<HTMLDivElement>(null); // Center AI Garden
  const refDeepSeek = useRef<HTMLDivElement>(null); 

  return (
    <div
      className="relative flex h-[400px] w-full max-w-lg items-center justify-center overflow-hidden rounded-lg p-6 mx-auto"
      ref={containerRef}
    >
      {/* Icon Layout - Map desired icons */}
      <div className="flex size-full flex-col items-stretch justify-between gap-10">
        {/* Top Row */}
        <div className="flex flex-row items-center justify-between">
          <Circle ref={refGrok}><Icons.grok /></Circle>
          <Circle ref={refGemini}><Icons.gemini /></Circle>
        </div>
        {/* Middle Row */}
        <div className="flex flex-row items-center justify-between">
          <Circle ref={refOpenAI}><Icons.openai /></Circle>
          <Circle ref={refCenter} className="size-16 border-[#ad4f11]">
            <Icons.aiGarden />
          </Circle>
          <Circle ref={refAnthropic}><Icons.anthropic /></Circle>
        </div>
        {/* Bottom Row */}
        <div className="flex flex-row items-center justify-between">
          <Circle ref={refMeta}><Icons.meta /></Circle>
          <Circle ref={refDeepSeek}><Icons.deepseek /></Circle> 
        </div>
      </div>

      {/* Beams - Update refs and potentially colors */}
      <AnimatedBeam containerRef={containerRef} fromRef={refGrok} toRef={refCenter} curvature={-75} endYOffset={-10} />
      <AnimatedBeam containerRef={containerRef} fromRef={refOpenAI} toRef={refCenter} />
      <AnimatedBeam containerRef={containerRef} fromRef={refMeta} toRef={refCenter} curvature={75} endYOffset={10} />
      
      <AnimatedBeam containerRef={containerRef} fromRef={refGemini} toRef={refCenter} curvature={-75} endYOffset={-10} reverse />
      <AnimatedBeam containerRef={containerRef} fromRef={refAnthropic} toRef={refCenter} reverse />
      <AnimatedBeam containerRef={containerRef} fromRef={refDeepSeek} toRef={refCenter} curvature={75} endYOffset={10} reverse />
    </div>
  );
}

export function LandingPageComponent() {
    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen bg-white dark:bg-black py-16 px-4 overflow-hidden">
            {/* Background Gradient (Optional) */}
            <div
              className="pointer-events-none absolute inset-0 -z-10"
              style={{
                  background: `radial-gradient(circle at top right, rgba(173, 79, 17, 0.1) 0%, transparent 50%), 
                               radial-gradient(circle at bottom left, rgba(173, 79, 17, 0.1) 0%, transparent 50%)`,
              }}
            />
            
            {/* Title Section */}
            <div className="mb-10 flex flex-col items-center justify-center text-center">
                {/* Logo and Main Title Row */}
                <div className="flex items-center justify-center">
                    <Box size={48} className="mr-3 text-[#ad4f11]" /> 
                    <h1 className="text-5xl font-bold text-zinc-800 dark:text-zinc-200 tracking-tight">
                        AI GARDEN
                    </h1>
                </div>
                {/* Subheading */}
                <p className="mt-3 text-lg uppercase font-light text-[#ad4f11] tracking-wider">
                    All Your AI Tools - All In One Place
                </p>
            </div>

            {/* Animated Beam Section */}
            <AnimatedBeamSection />

            {/* Call to Action Button */}
            <div className="mt-12">
                 <Link href="/chat" passHref>
                    <GradientButton variant="default">
                        Free Access
                    </GradientButton>
                </Link>
            </div>

            {/* Optional: Add footer or more marketing text */}
        </div>
    );
} 