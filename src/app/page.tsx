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
import { useRouter } from 'next/navigation'; // Import useRouter

// Define LLM models
const LLM_MODELS = {
  GPT_4_5: { id: 'gpt-4.5-preview', name: 'ChatGPT 4.5' },
  GPT_4O: { id: 'gpt-4o', name: 'ChatGPT 4o' },
  GROK_2: { id: 'grok-2', name: 'Grok 2' },
  GEMINI_FLASH: { id: 'gemini-2.0-flash-exp-image-generation', name: 'Gemini Flash (Image)' },
  GEMINI_PRO: { id: 'gemini-2.5-pro-preview-03-25', name: 'Gemini 2.5 Pro' },
};

const MotionButton = motion(Button);

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Simulate auth state
  const [files, setFiles] = useState<File[]>([]);
  const [selectedLlm, setSelectedLlm] = useState<{ id: string; name: string } | null>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // --- Authentication Check ---
  useEffect(() => {
    // Simulate checking auth status (e.g., from local storage)
    const loggedIn = localStorage.getItem('demoLoggedIn') === 'true';
    if (!loggedIn) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]); // Run only once on mount or when router changes


  // --- useChat Hook Integration ---
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: handleChatSubmit,
    isLoading,
    error,
    // Add other relevant properties from useChat if needed (e.g., setMessages, reload, stop)
  } = useChat({
    api: "/api/chat",
    initialMessages: [],
    body: {
      model: selectedLlm?.id ?? '', // Pass the ID of the selected LLM
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
    // Only enable the hook if authenticated (optional optimization, but safer)
    // You might need to adjust how `useChat` handles being disabled/enabled if needed.
    // For now, we initialize it always but render UI conditionally.
  });

  // --- Helper Functions ---

  // Scroll to bottom when messages change
  useEffect(() => {
    if (isAuthenticated) { // Only scroll if authenticated and UI is visible
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAuthenticated]);

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
      // TODO: Add user feedback (toast notification)
      return;
    }
    if (input.trim() || files.length > 0) {
      handleChatSubmit(e); // Call the useChat hook's submit handler
    }
  };

  // --- Conditional Rendering ---
  if (!isAuthenticated) {
    // Return null or a loading indicator while redirecting
    return null;
  }

  // --- Render Chat UI if Authenticated ---
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-end p-6 sm:p-12 pb-20">
      {/* Header */}
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="size-8">
          <User className="h-4 w-4" />
          <span className="sr-only">Profile</span>
        </Button>
      </div>

      {/* Central Shimmer Text - Updated to new green #018771 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
        <TextShimmer
          duration={1.2}
          // Using #018771 for base and #01A98C for gradient
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

                 {/* LLM Selector - Updated to new green #018771 */}
                 <PromptInputAction tooltip="Select Model">
                   <DropdownMenu>
                     <DropdownMenuTrigger asChild disabled={isLoading}>
                       <MotionButton
                         variant="ghost"
                         size="icon"
                         className={cn(
                           "size-8 relative overflow-hidden focus-visible:outline-none",
                           !selectedLlm &&
                             // Use new green #018771 and #01A98C for animation
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
                         {/* Always apply new green color to Box icon */}
                         <Box size={20} strokeWidth={1.5} className="text-[#018771]" />
                       </MotionButton>
                     </DropdownMenuTrigger>
                     <DropdownMenuContent align="start">
                       {Object.values(LLM_MODELS).map((llm) => (
                          <DropdownMenuItem
                            key={llm.id}
                            onSelect={() => selectLlm(llm)}
                            disabled={isLoading}
                          >
                            {llm.name}
                          </DropdownMenuItem>
                       ))}
                     </DropdownMenuContent>
                   </DropdownMenu>
                 </PromptInputAction>
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
