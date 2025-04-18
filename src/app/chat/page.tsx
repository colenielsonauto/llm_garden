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
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { LayoutDashboard, UserCog, Settings, LogOut, ArrowUp, Paperclip, Square, X, Box, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useChat, type Message } from "ai/react";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from "next-auth/react";
import { AvatarWithInitials } from '@/components/ui/avatar-initials';
import { ChatMessages } from '@/components/morphic/chat-messages'

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

// Sidebar Logo Components (from Demo.tsx)
const Logo = () => {
  return (
    <Link
      href="/"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <Image src="/logo.png" alt="AI Garden Logo" width={20} height={20} className="h-5 w-5 flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        AI Garden
      </motion.span>
    </Link>
  );
};

const LogoIcon = () => {
  return (
    <Link
      href="/"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <Image src="/logo.png" alt="AI Garden Logo Icon" width={20} height={20} className="h-5 w-5 flex-shrink-0" />
    </Link>
  );
};

// Sidebar Links (from Demo.tsx)
const createLinks = () => [
  {
    label: "Dashboard",
    href: "#",
    icon: (
      <LayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
    ),
  },
  {
    label: "Profile",
    href: "#",
    icon: (
      <UserCog className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
    ),
  },
  {
    label: "Settings",
    href: "#",
    icon: (
      <Settings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
    ),
  },
  {
    label: "Logout",
    onClick: () => {
        signOut({ callbackUrl: '/login' });
    },
    icon: (
      <LogOut className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
    ),
  },
];

// Define props interface for Dashboard component
interface DashboardProps {
  selectedLlm: { id: string; name: string } | null;
  messages: Message[]; // Use imported Message type
  input: string | undefined;
  handlePromptInputChange: (value: string) => void;
  handleFormSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  error: Error | undefined; // Allow undefined from useChat
  files: File[];
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveFile: (index: number) => void;
  uploadInputRef: React.RefObject<HTMLInputElement | null>; // Allow null ref
  messagesEndRef: React.RefObject<HTMLDivElement | null>; // Allow null ref
  showSearch: boolean;
  setShowSearch: React.Dispatch<React.SetStateAction<boolean>>;
  selectLlm: (llm: { id: string; name: string }) => void;
  showNewModelIndicator: boolean;
  setShowNewModelIndicator: React.Dispatch<React.SetStateAction<boolean>>;
  setIsModelDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isModelSelectorActive: boolean | null; // Allow null from calculation
  status: 'authenticated' | 'loading' | 'unauthenticated' | undefined;
}

export default function ChatPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [selectedLlm, setSelectedLlm] = useState<{ id: string; name: string } | null>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // State for custom indicators
  const [showNewModelIndicator, setShowNewModelIndicator] = useState(true); // Only keep state for New Tool indicator
  const [showSearch, setShowSearch] = useState(false); // State for search toggle - Default OFF
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false); // State for model dropdown

  // --- Sidebar State ---
  const [open, setOpen] = useState(false);

  // --- Use next-auth session --- status might be undefined during SSR
  const { status, data: session } = useSession();

  // --- Create dynamic links for sidebar (can be simplified if needed) ---
  const sidebarLinks = createLinks();

  // --- useChat Hook Integration (Remains the same) ---
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
      useWebSearch: showSearch,
    },
    onResponse: (res) => {
      if (!res.ok) {
        console.error("Chat hook error response:", res);
      }
    },
    onFinish: () => {
      setFiles([]);
      if (uploadInputRef?.current) {
        uploadInputRef.current.value = "";
      }
    },
    onError: (err) => {
      console.error("Chat hook error:", err);
    },
  });

  // --- Helper Functions (Remain mostly the same) ---
  useEffect(() => {
    if (status === 'authenticated') {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, status]);

  const handlePromptInputChange = (value: string) => {
    const event = {
      target: { value },
    } as React.ChangeEvent<HTMLTextAreaElement>;
    handleInputChange(event);
  };

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

  const selectLlm = (llm: { id: string; name: string }) => {
    if (isLoading) return;
    setSelectedLlm(llm);
  };

  // --- MODIFIED Form Submit Handler ---
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (status !== 'authenticated') {
      router.push('/login');
      return;
    }

    // Determine the model ID to use, defaulting to GPT-4o if none is selected
    const modelToUse = selectedLlm ?? LLM_MODELS.GPT_4O; 
    const modelIdToUse = modelToUse.id;

    if (input.trim() || files.length > 0) {
      // If no model was selected, update the state to reflect the default choice *before* submitting
      if (!selectedLlm) {
        setSelectedLlm(modelToUse);
      }
      
      // Pass the determined model ID and search status in the body of the options
      handleChatSubmit(e, { body: { model: modelIdToUse, useWebSearch: showSearch } });
    } else {
      console.log("Submission prevented: No input and no files.");
    }
  };

  const isModelSelectorActive = selectedLlm && !isModelDropdownOpen;

  // --- Conditional Rendering ---
  // No need for status === 'loading' check here unless desired
  // if (status === 'loading') { ... }

  // --- Main UI ---
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1",
        "h-screen" 
      )}
    >
      {/* Sidebar - Only show useful links if logged in? Or hide user info? */}
      <Sidebar open={open} setOpen={setOpen}>
         <SidebarBody className="justify-between gap-10">
           <div className="overflow-y-auto overflow-x-hidden">
             {open ? <Logo /> : <LogoIcon />}
             {/* Decide if sidebar links should be shown when unauthenticated */}
             {status === 'authenticated' && (
                <div className="mt-4 flex flex-col gap-1">
                 {sidebarLinks.map((link, idx) => (
                    <SidebarLink key={idx} link={link} />
                 ))}
               </div>
             )}
           </div>
           {/* Conditionally render User Info */} 
           {status === 'authenticated' && session?.user && (
              <div>
                 <SidebarLink
                   link={{
                     label: session.user.name || session.user.email || "User", // Display name or email
                     href: "#", // Link to profile page eventually
                     icon: (
                       session.user.image ? (
                         // Use Image if available
                         <Image
                           src={session.user.image}
                           className="h-7 w-7 flex-shrink-0 rounded-full"
                           width={50}
                           height={50}
                           alt="Avatar"
                         />
                       ) : (
                         // Otherwise, use initials
                         <AvatarWithInitials
                           name={session.user.name || session.user.email || '?'}
                         />
                       )
                     ),
                   }}
                 />
              </div>
           )}
         </SidebarBody>
       </Sidebar>

      {/* Main Content Area (Chat Interface) */}
      <Dashboard
        selectedLlm={selectedLlm}
        messages={messages}
        input={input ?? ''}
        handlePromptInputChange={handlePromptInputChange}
        handleFormSubmit={handleFormSubmit}
        isLoading={isLoading}
        error={error}
        files={files}
        handleFileChange={handleFileChange}
        handleRemoveFile={handleRemoveFile}
        uploadInputRef={uploadInputRef}
        messagesEndRef={messagesEndRef}
        showSearch={showSearch}
        setShowSearch={setShowSearch}
        selectLlm={selectLlm}
        showNewModelIndicator={showNewModelIndicator}
        setShowNewModelIndicator={setShowNewModelIndicator}
        setIsModelDropdownOpen={setIsModelDropdownOpen}
        isModelSelectorActive={isModelSelectorActive}
        status={status}
      />
    </div>
  );
}

// Dashboard component now holds the main chat UI and receives props
const Dashboard = ({
  selectedLlm,
  messages,
  input,
  handlePromptInputChange,
  handleFormSubmit,
  isLoading,
  error,
  files,
  handleFileChange,
  handleRemoveFile,
  uploadInputRef,
  messagesEndRef,
  showSearch,
  setShowSearch,
  selectLlm,
  showNewModelIndicator,
  setShowNewModelIndicator,
  setIsModelDropdownOpen,
  isModelSelectorActive,
  status
}: DashboardProps) => {
  // Use unknown for better type safety
  const trackFrontendEvent = (eventType: string, eventData: Record<string, unknown>) => {
    // Fire-and-forget fetch call
    fetch('/api/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ eventType, eventData }),
    }).catch(error => {
      console.warn('[Frontend Tracking] Failed to send event to API:', error);
    });
  };

  return (
    <div className="flex flex-1 relative"> {/* Parent for absolute positioning */}
      {/* Absolutely Positioned Model Name (only when messages exist) */}
      {messages.length > 0 && (
        <div className="absolute top-4 left-4 pointer-events-none z-10"> 
          <TextShimmer
            duration={1.2}
            className='text-2xl font-medium [--base-color:#ad4f11] [--base-gradient-color:#d9804a] dark:[--base-color:#ad4f11] dark:[--base-gradient-color:#d9804a]'
          >
            {selectedLlm?.name ?? ''} 
          </TextShimmer>
        </div>
      )}

      <div className="flex flex-col flex-1 w-full h-full p-6 sm:p-12 pb-20 bg-background">
        {/* Header Area within Dashboard */}
        <div className="absolute top-4 right-4 flex items-center space-x-2 z-20"> {/* Keep theme toggle top right */}
           <ThemeToggle />
        </div>

        {/* Main content area: flex column, grows, allows shrinking */}
        <div className="flex flex-col flex-grow min-h-0">

          {/* Conditional Rendering based on messages */}
          {messages.length === 0 ? (
            // State 1: No messages -> Center the text block
            <div className="flex flex-col flex-grow items-center justify-center pointer-events-none">
              <TextShimmer
                duration={1.2}
                className='text-2xl font-medium text-center [--base-color:#ad4f11] [--base-gradient-color:#d9804a] dark:[--base-color:#ad4f11] dark:[--base-gradient-color:#d9804a]'
              >
                {selectedLlm ? selectedLlm.name : "Welcome to your AI Garden"}
              </TextShimmer>
              {/* Beta Tag - Show if no model selected initially */}
              { !selectedLlm && (
                 <span className="mt-2 text-sm font-medium text-[#ad4f11] border border-[#ad4f11] rounded-md px-2 py-0.5 pointer-events-auto">
                   Beta
                 </span>
              )}
            </div>
          ) : (
            // State 2: Messages exist -> Render using ChatMessages
            <ChatMessages messages={messages} isLoading={isLoading} />
          )}

          {/* Input Form - Always at the bottom */} 
          <form onSubmit={handleFormSubmit} className="w-full max-w-4xl space-y-4 mt-auto self-center"> {/* Use mt-auto to push to bottom, self-center */} 
             {/* --- Input component and actions remain the same --- */}
             <PromptInput
               value={input ?? ''}
               onValueChange={handlePromptInputChange}
               isLoading={isLoading}
               className="w-full"
             >
               {/* File display */}
               {files.length > 0 && (
                 <div className="flex flex-wrap gap-2 pb-2 px-2 border-b mb-2">
                   {files.map((file: File, index: number) => ( // Add types for file and index
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
                        onClick={() => trackFrontendEvent('button_click', { buttonName: 'attach_file_label' })}
                      >
                        <input
                          ref={uploadInputRef}
                          type="file"
                          multiple
                          onChange={(e) => {
                            const selectedFiles = Array.from(e.target.files || []);
                            trackFrontendEvent('file_upload', { fileCount: selectedFiles.length, fileNames: selectedFiles.map(f => f.name) });
                            handleFileChange(e);
                          }}
                          className="hidden"
                          id="file-upload"
                          disabled={isLoading}
                        />
                        <Paperclip className="text-muted-foreground size-5" />
                      </label>
                    </PromptInputAction>

                    {/* Search Toggle Button */}
                    <PromptInputAction tooltip={showSearch ? "Disable web search" : "Enable web search"}>
                      <button
                        type="button"
                        onClick={() => {
                            trackFrontendEvent('button_click', { buttonName: 'toggle_web_search', newState: !showSearch });
                            setShowSearch(!showSearch);
                        }}
                        className={cn(
                          "flex h-8 items-center gap-2 rounded-full border px-1.5 py-1 transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                          showSearch
                            ? "border-[#ad4f11] bg-[#ad4f11]/10 text-[#ad4f11]"
                            : "border-transparent bg-secondary text-secondary-foreground hover:bg-muted"
                        )}
                        disabled={isLoading}
                      >
                        <div className="flex h-5 w-5 items-center justify-center"> {/* Fixed size container for icon */}
                          <motion.div
                            animate={{
                              rotate: showSearch ? 180 : 0, // Rotate icon when search is enabled
                              scale: showSearch ? 1.1 : 1,
                            }}
                            transition={{
                              type: "spring",
                              stiffness: 260,
                              damping: 15, // Reduced damping for more overshoot/rocking
                            }}
                          >
                            <Globe
                              className={cn(
                                "size-5 flex-shrink-0", // Use size-5 for consistency
                                showSearch ? "text-[#ad4f11]" : "text-muted-foreground"
                              )}
                            />
                          </motion.div>
                        </div>
                        <AnimatePresence>
                          {showSearch && (
                            <motion.span
                              initial={{ width: 0, opacity: 0 }}
                              animate={{ width: "auto", opacity: 1 }}
                              exit={{ width: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden whitespace-nowrap text-sm text-[#ad4f11]"
                            >
                              Search
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </button>
                    </PromptInputAction>

                    {/* LLM Selector Wrapper for positioning */}
                    <div className="relative">
                      {/* Ensure selectedLlm is checked before accessing name */}
                      <PromptInputAction tooltip={selectedLlm ? selectedLlm.name : "Select Model"}>
                        <DropdownMenu onOpenChange={(open) => {
                          if (open) trackFrontendEvent('button_click', { buttonName: 'open_model_dropdown' });
                          setIsModelDropdownOpen(open);
                          if (open) setShowNewModelIndicator(false);
                        }}>
                          <DropdownMenuTrigger asChild disabled={isLoading}>
                            <MotionButton
                              key={selectedLlm ? selectedLlm.id : "no-model"}
                              variant="ghost"
                              size="icon"
                              className={cn(
                                // Base styles
                                "relative flex h-8 items-center gap-2 rounded-full border transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                                // Active state OR Default unselected state -> Apply active styles + matching hover styles
                                (isModelSelectorActive || (!selectedLlm && !isModelSelectorActive)) && 
                                  "w-auto px-1.5 py-1 border-[#ad4f11] bg-[#ad4f11]/10 text-[#ad4f11] hover:bg-[#ad4f11]/10 hover:text-[#ad4f11] overflow-hidden",
                                // Icon-only state (model selected, dropdown open)
                                !isModelSelectorActive && (selectedLlm && !isModelSelectorActive) &&
                                  "w-8 p-0 border-transparent bg-secondary text-secondary-foreground hover:bg-muted overflow-hidden"
                              )}
                            >
                              {/* Use original structure for content */}
                              <div className="flex h-5 w-5 items-center justify-center flex-shrink-0">
                                <motion.div
                                  animate={{ scale: isModelSelectorActive ? 1.1 : 1 }} // Scale only when truly active
                                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                >
                                  <Box size={20} strokeWidth={1.5} className="currentColor" />
                                </motion.div>
                              </div>
                              <AnimatePresence>
                                {/* Show text if active OR default unselected */}
                                {(isModelSelectorActive || (!selectedLlm && !isModelSelectorActive)) && (
                                  <motion.span
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: "auto", opacity: 1 }}
                                    exit={{ width: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden whitespace-nowrap text-sm currentColor"
                                  >
                                    {selectedLlm ? selectedLlm.name : "Select Your Model"}
                                  </motion.span>
                                )}
                              </AnimatePresence>
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
                                   <span className="ml-2 text-xs font-medium text-[#ad4f11] border border-[#ad4f11] rounded px-1.5 py-0.5">
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
                          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 overflow-hidden rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground shadow-md"
                          style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}
                        >
                          New Tool
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-background" style={{ filter: 'drop-shadow(0 1px 0 oklch(var(--border) / 0.5))' }}></div>
                        </motion.div>
                      )}
                    </div>

                 </div>

                 {/* Submit Button - Use the status prop */}
                 <PromptInputAction
                   tooltip={status !== 'authenticated' ? 'Sign in to send' : (isLoading ? "Stop generation" : "Send message")}
                 >
                   <Button
                     type="submit"
                     variant="default"
                     size="icon"
                     className="h-8 w-8 rounded-full"
                     disabled={status !== 'authenticated' || isLoading || (!input?.trim() && files.length === 0)}
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
      </div>
    </div>
  );
};
