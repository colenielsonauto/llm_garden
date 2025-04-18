"use client";

import React, { forwardRef, useRef, useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import AnimatedBorderButton from "@/components/ui/animated-border-button"; // Import new button
import Image from "next/image";
// Import the new Icon Cloud component
import { IconCloudLanding } from "@/components/IconCloudLanding";
// Import Lobe Icons
import { 
    Grok, 
    OpenAI, 
    Gemini, 
    Anthropic, 
    Meta, 
    DeepSeek
} from "@lobehub/icons";
import { Button } from "@/components/ui/button"; // Added for Navbar/Pricing
import { Card } from "@/components/ui/card"; // Added for Features/Pricing
import { Badge } from "@/components/ui/badge"; // Added for Pricing
import { Input } from "@/components/ui/input"; // Added for Footer
import { Label } from "@/components/ui/label"; // Added for Footer
import { Switch } from "@/components/ui/switch"; // Added for Footer
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // Added for Footer
import { useId } from "react"; // Added for GridPattern
import { motion } from "framer-motion"; // Corrected import
import {
  User, Moon, Sun, Zap, Shield, Users, Clock, Globe, Layers,
  Check, X, MoveRight, PhoneCall, Facebook, Instagram, Linkedin, Send, Twitter, Youtube, Github
} from "lucide-react";

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
  // Central Logo - Increase size
  aiGarden: () => <Image src="/logo.png" alt="AI Garden Logo" width={48} height={48} />, // Increased from 32x32
};

// --- Navbar Component ---
interface NavItem {
  to?: string
  text: string
  items?: {
    icon?: {
      dark: string
      light: string
    }
    text: string
    description?: string
    to: string
  }[]
}

interface NavbarProps {
  className?: string
  isSticky?: boolean
  isStickyOverlay?: boolean
  withBorder?: boolean
  logo?: React.ReactNode
  menuItems?: NavItem[]
  onThemeChange?: () => void
  rightContent?: React.ReactNode
}

const ChevronIcon = () => (
  <svg
    width="10"
    height="6"
    viewBox="0 0 10 6"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-2.5 opacity-60 [&_path]:stroke-2"
  >
    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const Navigation: React.FC<{ items: NavItem[] }> = ({ items }) => (
  <nav>
    <ul className="flex gap-x-10 xl:gap-x-8 lg:hidden [@media(max-width:1070px)]:gap-x-6">
      {items && items.map(({ to, text, items: subItems }, index) => {
        const Tag = to ? Link : 'button';
        return (
          <li
            className={cn('relative [perspective:2000px]', subItems && subItems.length > 0 && 'group')}
            key={index}
          >
            <Tag
              className="flex items-center gap-x-1 whitespace-pre text-sm text-foreground"
              href={to || '#'}
            >
              {text}
              {subItems && subItems.length > 0 && <ChevronIcon />}
            </Tag>
            {subItems && subItems.length > 0 && (
              <div
                className={cn(
                  'absolute -left-5 top-full w-[300px] pt-5',
                  'pointer-events-none opacity-0',
                  'origin-top-left transition-[opacity,transform] duration-200 [transform:rotateX(-12deg)_scale(0.9)]',
                  'group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100 group-hover:[transform:none]'
                )}
              >
                <ul
                  className="relative flex min-w-[248px] flex-col gap-y-0.5 rounded-[14px] border border-border bg-background p-2.5 shadow-[0px_14px_20px_0px_rgba(0,0,0,.5)]"
                >
                  {subItems.map(({ icon, text: subText, description, to: subTo }, subIndex) => (
                    <li key={subIndex}>
                      <Link
                        className="group/link relative flex items-center overflow-hidden whitespace-nowrap rounded-[14px] p-2 text-foreground before:absolute before:inset-0 before:z-10 before:opacity-0 before:transition-opacity before:duration-200 hover:before:opacity-100 before:bg-muted"
                        href={subTo}
                      >
                        {icon && (
                          <div
                            className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted"
                          >
                            <Image
                              className="h-5 w-5"
                              src={icon.dark}
                              width={20}
                              height={20}
                              loading="lazy"
                              alt=""
                              aria-hidden
                            />
                          </div>
                        )}
                        <div className="relative z-10 ml-3">
                          <span className="block text-sm font-medium">{subText}</span>
                          {description && (
                            <span className="mt-0.5 block text-sm text-muted-foreground">
                              {description}
                            </span>
                          )}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  </nav>
)

const MobileMenuButton: React.FC<{ onClick: () => void }> = ({
  onClick,
}) => (
  <button
    className="hidden lg:block relative h-8 w-8 text-foreground"
    onClick={onClick}
  >
    <span className="absolute left-1/2 top-1/2 block h-0.5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current" />
    <span className="absolute left-1/2 top-1/2 block h-0.5 w-5 -translate-x-1/2 translate-y-1 rounded-full bg-current" />
  </button>
)

const Navbar: React.FC<NavbarProps> = ({
  className,
  isSticky = false,
  isStickyOverlay = false,
  withBorder = false,
  logo,
  menuItems = [],
  onThemeChange,
  rightContent,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const [theme, setTheme] = React.useState<'light' | 'dark'>('dark'); // Manage theme state

  const handleThemeChange = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    if (onThemeChange) onThemeChange(); // Call prop if provided
  }

  // Set initial theme on mount
  React.useEffect(() => {
     document.documentElement.classList.add('dark');
  }, []);

  return (
    <header
      className={cn(
        'relative z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        isSticky && 'sticky top-0',
        isStickyOverlay && 'backdrop-blur-md',
        withBorder && 'border-b border-border',
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-0 py-4"> {/* Set px-0 for flush left/right */} 
        <div className="flex items-center justify-between">
          {logo}
          <Navigation items={menuItems} />
          <div className="flex items-center gap-x-6">
            {rightContent}
            {/* Theme Toggle Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={handleThemeChange}
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            <MobileMenuButton
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </div>
        </div>
      </div>
    </header>
  )
}

// --- END Navbar Component ---

// --- Features Section ---
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

// Add GridPattern definition here or ensure it's imported
export function GridPattern({ width, height, x, y, squares, ...props }: any) {
  const patternId = useId();

  return (
    <svg aria-hidden="true" {...props}>
      <defs>
        <pattern
          id={patternId}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path d={`M.5 ${height}V.5H${width}`} fill="none" />
        </pattern>
      </defs>
      <rect
        width="100%"
        height="100%"
        strokeWidth={0}
        fill={`url(#${patternId})`}
      />
      {squares && squares.length > 0 && ( // Check if squares exist and is not empty
        <svg x={x} y={y} className="overflow-visible">
          {squares.map(([x, y]: any, index: number) => (
            <rect
              strokeWidth="0"
              key={`${x}-${y}-${index}`} // Use a more robust key if possible, index is fallback
              width={width + 1}
              height={height + 1}
              x={x * width}
              y={y * height}
            />
          ))}
        </svg>
      )}
    </svg>
  );
}

export const Grid = ({
  pattern: initialPattern, // Rename prop to avoid conflict
  size,
}: {
  pattern?: number[][];
  size?: number;
}) => {
  // Use state to hold the pattern, initialize to null or empty array
  const [currentPattern, setCurrentPattern] = useState<number[][] | null>(initialPattern ?? null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Generate pattern only on client-side after mount if no initial pattern was provided
    if (!initialPattern) {
      setCurrentPattern([
        [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
        [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
        [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
        [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
        [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
      ]);
    }
  }, [initialPattern]); // Re-run if initialPattern changes (though unlikely for this use case)

  // Don't render GridPattern on the server or initial client render if pattern is generated client-side
  if (!isMounted && !initialPattern) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute left-1/2 top-0 -ml-20 -mt-2 h-full w-full [mask-image:linear-gradient(white,transparent)]">
      <div className="absolute inset-0 bg-gradient-to-r [mask-image:radial-gradient(farthest-side_at_top,white,transparent)] dark:from-zinc-900/30 from-zinc-100/30 to-zinc-300/30 dark:to-zinc-900/30 opacity-100">
        {/* Only render GridPattern if currentPattern is available */}
        {currentPattern && (
            <GridPattern
            width={size ?? 20}
            height={size ?? 20}
            x="-12"
            y="4"
            squares={currentPattern} // Use state variable
            className="absolute inset-0 h-full w-full mix-blend-overlay dark:fill-white/10 dark:stroke-white/10 stroke-black/10 fill-black/10"
            />
        )}
      </div>
    </div>
  );
};

const FeatureCard = ({
  icon,
  title,
  description,
  className,
}: FeatureCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      viewport={{ once: true }}
    >
      <Card
        className={cn(
          "relative h-full w-full overflow-hidden border",
          "dark:border-zinc-700 dark:bg-gradient-to-br dark:from-zinc-950/50 dark:to-zinc-900/80",
          "border-zinc-200 bg-gradient-to-br from-zinc-50/50 to-zinc-100/80",
          "p-6",
          className
        )}
      >
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
          {icon}
        </div>
        <h3 className="mb-2 text-xl font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
        <Grid size={20} />
      </Card>
    </motion.div>
  );
};

// Updated features for AI Garden
const aiGardenFeatures = [
  {
    icon: <Layers className="h-6 w-6" />,
    title: "Unified Interface",
    description:
      "Access multiple leading AI models through a single, consistent chat interface.",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Multi-Model Access",
    description:
      "Connect to OpenAI, Gemini, Anthropic, Grok, and more, all in one place.",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Seamless Switching",
    description:
      "Effortlessly switch between models mid-conversation to leverage their unique strengths.",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Centralized Management",
    description:
      "Manage API keys, settings, and usage across all connected models easily.",
  },
];

function FeaturesSection() {
  return (
    <section className="relative overflow-hidden bg-background py-20 text-foreground lg:py-28">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
            Why AI Garden?
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Unify your AI workflow, access the best models, and streamline development.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"> {/* Adjusted grid for 4 features */} 
          {aiGardenFeatures.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
// --- END Features Section ---

// --- Pricing Section ---
interface BenefitProps {
  text: string;
  checked: boolean;
}

const Benefit = ({ text, checked }: BenefitProps) => {
  return (
    <div className="flex items-center gap-3">
      {checked ? (
        <span className="grid size-4 place-content-center rounded-full bg-primary text-sm text-primary-foreground">
          <Check className="size-3" />
        </span>
      ) : (
        <span className="grid size-4 place-content-center rounded-full dark:bg-zinc-800 bg-zinc-200 text-sm dark:text-zinc-400 text-zinc-600">
          <X className="size-3" />
        </span>
      )}
      <span className="text-sm dark:text-zinc-300 text-zinc-600">{text}</span>
    </div>
  );
};

interface PricingCardProps {
  tier: string;
  price: string;
  bestFor: string;
  CTA: string;
  benefits: Array<{ text: string; checked: boolean }>;
  className?: string;
  featured?: boolean;
}

const PricingCard = ({
  tier,
  price,
  bestFor,
  CTA,
  benefits,
  className,
  featured = false,
}: PricingCardProps) => {
  return (
    <motion.div
      initial={{ filter: "blur(2px)" }}
      whileInView={{ filter: "blur(0px)" }}
      transition={{ duration: 0.5, ease: "easeInOut", delay: 0.25 }}
    >
      <Card
        className={cn(
          "relative h-full w-full overflow-hidden border",
          "dark:border-zinc-700 dark:bg-gradient-to-br dark:from-zinc-950/50 dark:to-zinc-900/80",
          "border-zinc-200 bg-gradient-to-br from-zinc-50/50 to-zinc-100/80",
          "p-6",
          featured ? "shadow-lg border-primary" : "", // Highlight featured
          className
        )}
      >
        <div className="flex flex-col items-center border-b pb-6 dark:border-zinc-700 border-zinc-200">
          <span className="mb-6 inline-block dark:text-zinc-50 text-zinc-900">
            {tier}
          </span>
          <span className="mb-3 inline-block text-4xl font-medium">
            {price}
          </span>
          <span className="dark:bg-gradient-to-br dark:from-zinc-200 dark:to-zinc-500 bg-gradient-to-br from-zinc-700 to-zinc-900 bg-clip-text text-center text-transparent">
            {bestFor}
          </span>
        </div>
        <div className="space-y-4 py-9">
          {benefits.map((benefit, index) => (
            <Benefit key={index} {...benefit} />
          ))}
        </div>
        <Button
          className="w-full gap-2"
          variant={featured ? "default" : "ghost"}
        >
          {CTA}
          {featured ? <MoveRight className="h-4 w-4" /> : null}
        </Button>
      </Card>
    </motion.div>
  );
};

interface PricingSectionProps {
  title?: string;
  subtitle?: string;
}

function PricingSection({
  title = "Pricing",
  subtitle = "Start free, scale as you grow. Simple plans for every need.",
}: PricingSectionProps) {
  return (
    <section className="relative overflow-hidden bg-background text-foreground">
      <div className="relative z-10 mx-auto max-w-5xl px-4 py-20 md:px-8">
        <div className="mb-12 space-y-3">
          <div className="flex justify-center">
            <Badge className="mb-4">{title}</Badge>
          </div>
          <h2 className="text-center text-3xl font-semibold leading-tight sm:text-4xl sm:leading-tight md:text-5xl md:leading-tight">
            Simple, Transparent Pricing
          </h2>
          <p className="text-center text-base text-muted-foreground md:text-lg">
            {subtitle}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <PricingCard
            tier="Hobby"
            price="Free"
            bestFor="Individuals & Exploration"
            CTA="Get started free"
            benefits={[
              { text: "Connect up to 2 Models", checked: true },
              { text: "Basic Chat Interface", checked: true },
              { text: "Community Support", checked: true },
              { text: "Limited History", checked: false },
              { text: "Priority Access", checked: false },
            ]}
          />
          <PricingCard
            tier="Pro"
            price="$19/mo"
            bestFor="Professionals & Teams"
            CTA="Start Pro Trial"
            featured={true}
            benefits={[
              { text: "Connect Unlimited Models", checked: true },
              { text: "Advanced Chat Features", checked: true },
              { text: "Extended History", checked: true },
              { text: "Email & Chat Support", checked: true },
              { text: "Priority Access to New Models", checked: true },
            ]}
          />
          <PricingCard
            tier="Enterprise"
            price="Contact Us"
            bestFor="Large Organizations"
            CTA="Schedule Demo"
            benefits={[
              { text: "Everything in Pro", checked: true },
              { text: "Dedicated Support", checked: true },
              { text: "Custom Integrations", checked: true },
              { text: "SSO & Advanced Security", checked: true },
              { text: "Volume Discounts", checked: true },
            ]}
          />
        </div>
      </div>
    </section>
  );
}
// --- END Pricing Section ---

// --- Footer Component ---
interface FooterLinkProps {
  href: string
  children: React.ReactNode
}

const FooterLink: React.FC<FooterLinkProps> = ({ href, children }) => (
  <Link 
    href={href} 
    className="block transition-colors hover:text-primary text-sm"
  >
    {children}
  </Link>
)

interface SocialLinkProps {
  href: string
  label: string
  icon: React.ReactNode
}

const SocialLink: React.FC<SocialLinkProps> = ({ href, label, icon }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button asChild variant="outline" size="icon" className="rounded-full">
          <Link href={href} target="_blank" rel="noopener noreferrer">{icon}</Link>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
)

interface FooterComponentProps {
  companyName?: string
}

function FooterComponent({ companyName = "AI Garden" }: FooterComponentProps) { // Renamed to avoid conflict
  const [isDarkMode, setIsDarkMode] = React.useState(true); // Default to dark

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDarkMode])

  return (
    <footer className="relative border-t bg-background text-foreground transition-colors duration-300">
      <div className="container mx-auto px-4 py-12 md:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Simplified Footer - Removed Newsletter */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">AI Garden</h3>
             <Image src="/logo.png" alt="AI Garden Logo" width={40} height={40} className="mb-4" />
            <p className="text-sm text-muted-foreground">Unify your AI workflow.</p>
          </div>
         
          <div>
            <h3 className="mb-4 text-lg font-semibold">Navigation</h3>
            <nav className="space-y-2">
              <FooterLink href="#features">Features</FooterLink> {/* Update links to scroll */} 
              <FooterLink href="#pricing">Pricing</FooterLink>
              {/* <FooterLink href="/docs">Docs</FooterLink> */} 
              {/* <FooterLink href="/contact">Contact</FooterLink> */} 
            </nav>
          </div>
         
          <div>
            <h3 className="mb-4 text-lg font-semibold">Legal</h3>
            <nav className="space-y-2">
              <FooterLink href="/privacy">Privacy Policy</FooterLink>
              <FooterLink href="/terms">Terms of Service</FooterLink>
            </nav>
          </div>
         
          <div className="relative">
            <h3 className="mb-4 text-lg font-semibold">Follow Us</h3>
            <div className="mb-6 flex space-x-4">
              {/* Add relevant social links if available */}
               <SocialLink 
                href="https://github.com/your-repo" // Replace with actual link
                label="GitHub" 
                icon={<Github className="h-4 w-4" />} 
              />
              {/* <SocialLink 
                href="https://twitter.com" 
                label="Twitter" 
                icon={<Twitter className="h-4 w-4" />} 
              /> */} 
            </div>
             {/* Removed theme switch from footer as it's in Navbar */}
          </div>
        </div>
       
        <div className="mt-12 border-t pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {companyName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
// --- END Footer Component ---

export function LandingPageComponent() {
    // Navbar Menu Items
    const menuItems: NavItem[] = [
      { text: "Features", to: "#features" }, // Link to section ID
      { text: "Pricing", to: "#pricing" }
    ];

    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Navbar
          isSticky
          withBorder
          logo={
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/logo.png" alt="AI Garden Logo" width={32} height={32} />
              <span className="text-xl font-bold text-foreground">AI Garden</span>
            </Link>
          }
          menuItems={menuItems}
          rightContent={
            null // Launch App button completely removed
          }
        />

        <main className="flex-grow">
          {/* Hero Section */}
          <div className="relative flex flex-col items-center justify-center pt-24 pb-16 px-4 overflow-hidden">
              {/* Background Gradient */}
              <div
                className="pointer-events-none absolute inset-0 -z-10"
                style={{
                    background: `radial-gradient(circle at top right, rgba(173, 79, 17, 0.1) 0%, transparent 50%), radial-gradient(circle at bottom left, rgba(173, 79, 17, 0.1) 0%, transparent 50%)`,
                }}
              />
             
              {/* Title Section */}
              <div className="mb-10 flex flex-col items-center justify-center text-center">
                  {/* Main Title (Removed Logo here as it's in Navbar) */}
                  {/* Redundant AI GARDEN title removed */} 
                  {/* Subheading */}
                  {/* Tagline already removed */}
              </div>

              {/* Animated Beam Section */}
              <IconCloudLanding />

              {/* Call to Action Button */}
              <div className="mt-12"> {/* Restored margin-top back to 12 */} 
                   <AnimatedBorderButton /> {/* Removed 'text' prop as it's not supported */}
              </div>
          </div>

          {/* Features Section */}
          <div id="features"> {/* Add ID for scrolling */} 
            <FeaturesSection />
          </div>

          {/* Pricing Section */}
          <div id="pricing"> {/* Add ID for scrolling */} 
            <PricingSection />
          </div>

        </main>

        <FooterComponent />
      </div>
    );
} 