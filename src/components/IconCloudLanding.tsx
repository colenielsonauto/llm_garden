"use client"

import { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { IconCloud } from "@/components/ui/interactive-icon-cloud";
import Image from 'next/image';

// Placeholder Logo component - Replace with your actual Logo import and component if available
const Logo = ({ className }: { className?: string }) => (
  <Image
    src="/logo.png" // Assuming logo.png is in the public directory
    alt="Logo"
    width={96} // Default w-24
    height={96} // Default h-24
    className={cn(
      "scale-130 drop-shadow-lg",
      className
    )}
  />
);

// Default slugs from interactive-icon-cloud documentation. Replace with your desired slugs.
const slugs = [
  "typescript",
  "javascript",
  "react",
  "html5",
  "css3",
  "nodedotjs",
  "express",
  "nextdotjs",
  "prisma",
  "amazonaws",
  "postgresql",
  "firebase",
  "nginx",
  "vercel",
  "testinglibrary",
  "jest",
  "cypress",
  "docker",
  "git",
  "jira",
  "github",
  "gitlab",
  "visualstudiocode",
  "android",
  "ios",
  "swift",
  "flutter",
];

export function IconCloudLanding() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="relative z-0 w-full flex items-center justify-center overflow-hidden pt-16 pb-32">
      {/* Conditionally render IconCloud only on the client */}
      {isMounted && <IconCloud iconSlugs={slugs} />}
      <div 
        className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
      >
        <Logo className="w-24 h-24" />
      </div>
    </div>
  );
} 