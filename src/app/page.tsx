"use client";

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
import { useChat } from "ai/react"; // Import useChat hook
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown'; // <-- Import ReactMarkdown
import remarkGfm from 'remark-gfm'; // <-- Import remark-gfm for GFM support

// Define message structure (if needed by useChat, otherwise it provides its own)
// interface Message { // Likely provided by useChat
//   id: string;
//   role: "user" | "assistant" | "system" | "function" | "data" | "tool";
//   content: string;
// }

// Define LLM models with IDs and Names for selection
const LLM_MODELS = {
  GPT_4_5: { id: 'gpt-4.5-preview', name: 'ChatGPT 4.5' },
  GPT_4O: { id: 'gpt-4o', name: 'ChatGPT 4o' },
  GROK_2: { id: 'grok-2', name: 'Grok 2' }, // Added Grok 2
  GEMINI_FLASH: { id: 'gemini-2.0-flash-exp-image-generation', name: 'Gemini Flash (Image)' }, // Added Gemini Flash
  GEMINI_PRO: { id: 'gemini-2.5-pro-preview-03-25', name: 'Gemini 2.5 Pro' }, // Added Gemini Pro
};

const MotionButton = motion(Button);

export default function Home() {
  // Remove states managed by useChat
  // const [input, setInput] = useState("");
  // const [isLoading, setIsLoading] = useState(false);
  // const [messages, setMessages] = useState<Message[]>([]); // State for chat messages

  // Keep file state and refs
  const [files, setFiles] = useState<File[]>([]);
  // Update selectedLlm state type to hold the full object or null
  const [selectedLlm, setSelectedLlm] = useState<{ id: string; name: string } | null>(null); 
  // selectedLlmName is now derived from selectedLlm
  // const [selectedLlmName, setSelectedLlmName] = useState<string>("Choose your LLM"); 
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null); // Ref for scrolling

  // Integrate useChat hook
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: handleChatSubmit, // Renamed to avoid conflict with original handleSubmit
    isLoading,
    error, // Add error state from useChat
    // Add other relevant properties from useChat if needed (e.g., setMessages, reload, stop)
  } = useChat({
    api: "/api/chat", // Point to your API route
    initialMessages: [], // Start with no messages
    body: { // Send selected LLM ID in the request body
      model: selectedLlm?.id ?? '', // Pass the ID of the selected LLM, default to empty string if null
    },
    onResponse: (res) => { // Handle potential non-OK responses
      if (!res.ok) {
        // Handle API errors
        console.error("Chat hook error:", res);
        // Optionally display error in the UI
      }
    },
    onFinish: () => {
      // Action after submission finishes (e.g., clear files)
      setFiles([]);
      if (uploadInputRef?.current) {
        uploadInputRef.current.value = "";
      }
    },
    onError: (err) => {
      // Handle API errors
      console.error("Chat hook error:", err);
      // Optionally display error in the UI
    },
    // Initial messages can be set here if needed
    // initialMessages: [],
  });

  // Scroll to bottom when messages change (useChat messages)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Wrapper for PromptInput's onValueChange to work with useChat's handleInputChange
  const handlePromptInputChange = (value: string) => {
    // Simulate a ChangeEvent to pass to useChat's handler
    const event = {
      target: { value },
    } as React.ChangeEvent<HTMLTextAreaElement>; // Cast to expected type
    handleInputChange(event);
  };

  // Keep file handling functions
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
      // Remove handleInteraction as showShimmer is removed
      // handleInteraction();
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    if (uploadInputRef?.current) {
      uploadInputRef.current.value = "";
    }
  };

  // Remove handleInteraction as showShimmer state is removed
  // const handleInteraction = () => {
  //   if (showShimmer) {
  //     setShowShimmer(false);
  //   }
  // };

  // Update selectLlm to set the full LLM object
  const selectLlm = (llm: { id: string; name: string }) => {
    if (isLoading) return; // Prevent changing model while loading
    setSelectedLlm(llm); // Set the entire object
    // setSelectedLlmName(llm.name); // Remove setting separate name state
  };

  // Wrapper for form submission to include model check and call useChat's submit
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedLlm) {
      console.error("Please select a language model first.");
      // Optionally add user feedback here (e.g., toast notification)
      return;
    }
    // Check if there is input or files before submitting
    if (input.trim() || files.length > 0) {
      handleChatSubmit(e); // Call the useChat hook's submit handler
    }
  };


  return (
    <main className="relative flex min-h-screen flex-col items-center justify-end p-6 sm:p-12 pb-20">
      {/* Header section - Keep original structure */}
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="size-8">
          <User className="h-4 w-4" />
          <span className="sr-only">Profile</span>
        </Button>
      </div>

      {/* Central Shimmer Text - Update to display selectedLlmName */}
      {/* Remove conditional rendering based on showShimmer */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
        <TextShimmer
          duration={1.2}
          className='text-2xl font-medium text-center [--base-color:theme(colors.blue.600)] [--base-gradient-color:theme(colors.blue.200)] dark:[--base-color:theme(colors.blue.700)] dark:[--base-gradient-color:theme(colors.blue.400)]'
        >
          {/* Derive name from selectedLlm object or show default */}
          {selectedLlm ? selectedLlm.name : "Welcome to your AI Garden"} 
        </TextShimmer>
      </div>

      {/* Combined Chat messages and Input area container - Keep original structure */}
      <div className="w-full max-w-4xl flex flex-col flex-grow space-y-4 z-10">

        {/* Chat messages area - Map over useChat messages */}
        <div className="flex-grow overflow-y-auto mb-4 space-y-4 pr-4">
          {messages.map((m) => (
            <div
              key={m.id} // Use stable ID from useChat
              className={cn(
                "flex",
                m.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "rounded-lg px-4 py-2 max-w-[80%] prose dark:prose-invert", // Added prose classes for styling
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                )}
              >
                {/* Replace <p> with ReactMarkdown */}
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {m.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}
          {/* Display API errors from useChat hook */}
          {error && (
            <div className="flex justify-start">
              <div className="rounded-lg px-4 py-2 max-w-[80%] bg-destructive text-destructive-foreground">
                {/* Use ReactMarkdown for error messages too, if they might contain markdown */}
                <p className="text-sm whitespace-pre-wrap">Error: <ReactMarkdown remarkPlugins={[remarkGfm]}>{error.message}</ReactMarkdown></p>
              </div>
            </div>
          )}
           <div ref={messagesEndRef} /> {/* Element to scroll to */}
        </div>

        {/* Input Area - Use useChat state and handlers */}
        {/* Wrap input in a form element */} 
        <form onSubmit={handleFormSubmit} className="w-full space-y-4">
          <PromptInput
            // Use useChat's input state and handler
            value={input ?? ''} // Provide fallback for value
            onValueChange={handlePromptInputChange} // Use the wrapper function
            isLoading={isLoading} // Use useChat's loading state
            // onSubmit is handled by the form element
            // onSubmit={handleSubmit}
            className="w-full"
            // Remove disabled prop if not supported by PromptInput
            // disabled={isLoading}
          >
            {/* File display remains the same */}
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
                      type="button" // Prevent form submission
                      onClick={() => handleRemoveFile(index)}
                      className="hover:bg-muted rounded-full p-0.5"
                      aria-label="Remove file"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <PromptInputTextarea
              placeholder="Ask me anything..."
              // Remove direct value/onChange binding; PromptInput handles it
              // value={input} 
              // onChange={handleInputChange}
              onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                // Submit on Enter (if not shift)
                if (e.key === "Enter" && !e.shiftKey && !isLoading) {
                   e.preventDefault(); // Prevent newline
                   // Find the form element and manually trigger submit
                   const form = (e.target as HTMLElement).closest('form');
                   if (form) {
                     form.requestSubmit(); // Use requestSubmit for forms
                   }
                   // handleFormSubmit(e as any); // Avoid passing incompatible event
                }
              }}
              // Remove disabled prop if PromptInput handles it via isLoading
              // disabled={isLoading}
            />

            <PromptInputActions className="flex items-center justify-between gap-2 pt-2">
              <div className="flex items-center gap-1">
                {/* File Upload Input - Keep original structure */}
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

                {/* LLM Selector Dropdown - Update onSelect calls */}
                <PromptInputAction tooltip="Select Model">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild disabled={isLoading}>
                      <MotionButton
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "size-8 relative overflow-hidden focus-visible:outline-none",
                          !selectedLlm && // Check if selectedLlm is null
                            "bg-[length:200%_100%] bg-clip-padding [--base-color:theme(colors.blue.600)] [--base-gradient-color:theme(colors.blue.200)] dark:[--base-color:theme(colors.blue.700)] dark:[--base-gradient-color:theme(colors.blue.400)] [--bg:linear-gradient(90deg,transparent_40%,var(--base-gradient-color),transparent_60%)] [background-image:var(--bg),linear-gradient(var(--base-color),var(--base-color)) ]"
                        )}
                        animate={!selectedLlm ? { // Check if selectedLlm is null
                          backgroundPosition: ["150% center", "-50% center"],
                        }: {}}
                        transition={!selectedLlm ? { // Check if selectedLlm is null
                          repeat: Infinity,
                          duration: 1.2,
                          ease: "linear",
                        }: {}}
                        disabled={isLoading}
                      >
                        <Box size={20} strokeWidth={1.5} className={selectedLlm ? "text-primary" : "text-muted-foreground"} />
                      </MotionButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {/* Use LLM_MODELS constants */} 
                      <DropdownMenuItem onSelect={() => selectLlm(LLM_MODELS.GPT_4_5)} disabled={isLoading}>
                        {LLM_MODELS.GPT_4_5.name}
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => selectLlm(LLM_MODELS.GPT_4O)} disabled={isLoading}>
                        {LLM_MODELS.GPT_4O.name}
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => selectLlm(LLM_MODELS.GROK_2)} disabled={isLoading}>
                        {LLM_MODELS.GROK_2.name}
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => selectLlm(LLM_MODELS.GEMINI_FLASH)} disabled={isLoading}>
                        {LLM_MODELS.GEMINI_FLASH.name}
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => selectLlm(LLM_MODELS.GEMINI_PRO)} disabled={isLoading}>
                        {LLM_MODELS.GEMINI_PRO.name}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </PromptInputAction>
              </div>

              {/* Submit Button - Use form submission */}
              <PromptInputAction
                tooltip={isLoading ? "Stop generation" : "Send message"}
              >
                <Button
                  type="submit" // Trigger form submission
                  variant="default"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  // Disable if loading OR no input/files OR no model selected
                  disabled={isLoading || (!input.trim() && files.length === 0) || !selectedLlm} // Check if selectedLlm is null
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
        </form> { /* End Form */}

      </div> { /* End Combined Container */}
    </main>
  );
}
