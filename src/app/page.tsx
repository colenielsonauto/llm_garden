'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input";
import { Button } from "@/components/ui/button";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowUp, Paperclip, Square, X, User, Box } from "lucide-react";
import { motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { useChat } from "ai/react";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";

// Define LLM models
const LLM_MODELS = {
  GPT_4_5: { id: 'gpt-4.5-preview', name: 'ChatGPT 4.5' },
  GPT_4O: { id: 'gpt-4o', name: 'ChatGPT 4o' },
  GROK_2: { id: 'grok-2', name: 'Grok 2' },
  GROK_3: { id: 'grok-3', name: 'Grok 3' },
  GEMINI_FLASH: { id: 'gemini-2.0-flash-exp-image-generation', name: 'Gemini Flash (Image)' },
  GEMINI_PRO: { id: 'gemini-2.5-pro-preview-03-25', name: 'Gemini 2.5 Pro' },
};

const MotionButton = motion(Button);

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [selectedLlm, setSelectedLlm] = useState<{ id: string; name: string } | null>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // State for custom indicators
  const [showProfileIndicator, setShowProfileIndicator] = useState(true);
  const [showNewModelIndicator, setShowNewModelIndicator] = useState(true);

  // --- Use next-auth session --- 
  // Only get status if session data is not used
  const { status } = useSession({
    required: true, // Requires session, handles loading state
    onUnauthenticated() {
      // Redirect to login page if not authenticated
      router.push('/login'); 
    },
  });

  // --- useChat Hook Integration ---
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: handleChatSubmit,
    isLoading,
    error,
  } = useChat({
    api: "/api/chat",
    initialMessages: [],
    body: {
      model: selectedLlm?.id ?? '', 
    },
    onResponse: (res) => {
      if (!res.ok) {
        console.error("Chat hook error response:", res);
      }
    },
    onFinish: () => {
      setFiles([]); // Clear files after submission
      if (uploadInputRef?.current) {
        uploadInputRef.current.value = "";
      }
    },
    onError: (err) => {
      console.error("Chat hook error:", err);
    },
  });

  // --- Helper Functions ---

  // Scroll to bottom when messages change
  useEffect(() => {
    // Check session status instead of isAuthenticated state
    if (status === 'authenticated') { 
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, status]); // Depend on status

  // Wrapper for PromptInput's onValueChange
  const handlePromptInputChange = (value: string) => {
    const event = {
      target: { value },
    } as React.ChangeEvent<HTMLTextAreaElement>;
    handleInputChange(event);
  };

  // File handling
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    if (uploadInputRef?.current) {
      uploadInputRef.current.value = "";
    }
  };

  // Select LLM
  const selectLlm = (llm: { id: string; name: string }) => {
    if (isLoading) return;
    setSelectedLlm(llm);
  };

  // Form submission wrapper
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedLlm) {
      console.error("Please select a language model first.");
      return;
    }
    if (input.trim() || files.length > 0) {
      handleChatSubmit(e); 
    }
  };

  // --- Conditional Rendering based on session status ---
  if (status === 'loading') {
    // Optional: Render a loading spinner or skeleton screen
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  // If status is 'authenticated', render the main UI
  // (The onUnauthenticated callback handles the redirect)
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-end p-6 sm:p-12 pb-20">
      {/* Header */}
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        <ThemeToggle />

        {/* Profile Button Area */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => setShowProfileIndicator(false)} // Hide indicator on click
            aria-label="Profile"
          >
            <User className="h-4 w-4" />
          </Button>
          {/* Initially Visible "Coming Soon" Indicator */}
          {showProfileIndicator && (
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: showProfileIndicator ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className="absolute top-full right-0 mt-2 z-50 overflow-hidden rounded-md border bg-[#018771] px-3 py-1.5 text-xs text-white dark:text-white shadow-md"
              style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }} // Prevent interaction & wrapping
            >
              Coming Soon
              {/* Adjusted Arrow: Increased size slightly, ensured positioning */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-[#018771]" data-arrow="profile"></div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Central Shimmer Text - Updated to new green #018771 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
        {/* Beta Tag - Top Left */}
        <div className="absolute top-4 left-4 z-10">
          {/* Increased size of Beta tag */}
          <span className="text-lg font-medium text-[#018771] border-2 border-[#018771] rounded-lg px-3 py-1">
            Beta
          </span>
        </div>
        <TextShimmer
          duration={1.2}
          className='text-2xl font-medium text-center [--base-color:#018771] [--base-gradient-color:#01A98C] dark:[--base-color:#018771] dark:[--base-gradient-color:#01A98C]'
        >
          {selectedLlm ? selectedLlm.name : "Welcome to your AI Garden"}
        </TextShimmer>
      </div>

      {/* Chat Area */}
      <div className="w-full max-w-4xl flex flex-col flex-grow space-y-4 z-10">
        {/* Messages */}
        <div className="flex-grow overflow-y-auto mb-4 space-y-4 pr-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "flex",
                m.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "rounded-lg px-4 py-2 max-w-[80%] prose dark:prose-invert",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                )}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {m.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}
          {/* API Error Display */}
          {error && (
            <div className="flex justify-start">
              <div className="rounded-lg px-4 py-2 max-w-[80%] bg-destructive text-destructive-foreground">
                <p className="text-sm whitespace-pre-wrap">Error: <ReactMarkdown remarkPlugins={[remarkGfm]}>{error.message}</ReactMarkdown></p>
              </div>
            </div>
          )}
           <div ref={messagesEndRef} /> {/* Scroll target */}
        </div>

        {/* Input Form */}
        <form onSubmit={handleFormSubmit} className="w-full space-y-4">
          <PromptInput
            value={input ?? ''}
            onValueChange={handlePromptInputChange}
            isLoading={isLoading}
            className="w-full"
          >
            {/* File display */}
            {files.length > 0 && (
              <div className="flex flex-wrap gap-2 pb-2 px-2 border-b mb-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="bg-secondary flex items-center gap-2 rounded-lg px-3 py-1 text-sm"
                  >
                    <Paperclip className="size-3" />
                    <span className="max-w-[120px] truncate text-xs">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="hover:bg-muted rounded-full p-0.5"
                      aria-label="Remove file"
                      disabled={isLoading}
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <PromptInputTextarea
              placeholder="Ask me anything..."
              onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                if (e.key === "Enter" && !e.shiftKey && !isLoading) {
                   e.preventDefault();
                   const form = (e.target as HTMLElement).closest('form');
                   if (form) {
                     form.requestSubmit();
                   }
                }
              }}
            />

            <PromptInputActions className="flex items-center justify-between gap-2 pt-2">
              <div className="flex items-center gap-1">
                 {/* File Upload */}
                 <PromptInputAction tooltip="Attach files">
                   <label
                     htmlFor="file-upload"
                     className={cn("hover:bg-secondary flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors", isLoading && "cursor-not-allowed opacity-50")}
                   >
                     <input
                       ref={uploadInputRef}
                       type="file"
                       multiple
                       onChange={handleFileChange}
                       className="hidden"
                       id="file-upload"
                       disabled={isLoading}
                     />
                     <Paperclip className="text-muted-foreground size-5" />
                   </label>
                 </PromptInputAction>

                 {/* LLM Selector Wrapper for positioning */}
                 <div className="relative">
                   <PromptInputAction tooltip="Select Model">
                     <DropdownMenu onOpenChange={(open) => {
                       // Hide indicator when dropdown opens
                       if (open) setShowNewModelIndicator(false);
                     }}>
                       <DropdownMenuTrigger asChild disabled={isLoading}>
                         <MotionButton
                           variant="ghost"
                           size="icon"
                           className={cn(
                             "size-8 relative overflow-hidden focus-visible:outline-none",
                             !selectedLlm &&
                               "bg-[length:200%_100%] bg-clip-padding [--base-color:#018771] [--base-gradient-color:#01A98C] dark:[--base-color:#018771] dark:[--base-gradient-color:#01A98C] [--bg:linear-gradient(90deg,transparent_40%,var(--base-gradient-color),transparent_60%)] [background-image:var(--bg),linear-gradient(var(--base-color),var(--base-color)) ]"
                           )}
                           animate={!selectedLlm ? {
                             backgroundPosition: ["150% center", "-50% center"],
                           }: {}}
                           transition={!selectedLlm ? {
                             repeat: Infinity,
                             duration: 1.2,
                             ease: "linear",
                           }: {}}
                           disabled={isLoading}
                         >
                           <Box size={20} strokeWidth={1.5} className="text-[#018771]" />
                         </MotionButton>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent align="start">
                         {Object.values(LLM_MODELS).map((llm) => (
                            <DropdownMenuItem
                              key={llm.id}
                              onSelect={() => selectLlm(llm)}
                              disabled={isLoading}
                              className="flex justify-between items-center"
                            >
                              <span>{llm.name}</span>
                              {llm.id === 'grok-3' && (
                                <span className="ml-2 text-xs font-medium text-[#018771] border border-[#018771] rounded px-1.5 py-0.5">
                                  New
                                </span>
                              )}
                            </DropdownMenuItem>
                         ))}
                       </DropdownMenuContent>
                     </DropdownMenu>
                   </PromptInputAction>

                   {/* Initially Visible "New Tool!" Indicator */}
                   {showNewModelIndicator && (
                     <motion.div
                       initial={{ opacity: 1 }}
                       animate={{ opacity: showNewModelIndicator ? 1 : 0 }}
                       transition={{ duration: 0.3 }}
                       className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 overflow-hidden rounded-md border bg-[#018771] px-3 py-1.5 text-xs text-white dark:text-white shadow-md"
                       style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }} // Prevent interaction & wrapping
                     >
                       New Tool
                       {/* Adjusted Arrow: Increased size slightly, ensured positioning */}
                       <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-[#018771]" data-arrow="model"></div>
                     </motion.div>
                   )}
                 </div>

              </div>

              {/* Submit Button */}
              <PromptInputAction
                tooltip={isLoading ? "Stop generation" : "Send message"}
              >
                <Button
                  type="submit"
                  variant="default"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  disabled={isLoading || (!input.trim() && files.length === 0) || !selectedLlm}
                >
                  {isLoading ? (
                    <Square className="size-5 animate-pulse fill-current" />
                  ) : (
                    <ArrowUp className="size-5" />
                  )}
                </Button>
              </PromptInputAction>
            </PromptInputActions>
          </PromptInput>
        </form>
      </div>
    </main>
  );
}
