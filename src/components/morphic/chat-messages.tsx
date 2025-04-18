import { Message } from 'ai/react' // Use ai/react Message type, removed JSONValue
import { useEffect, /*useMemo,*/ useRef, /*useState*/ } from 'react' // Commented out unused imports
import { RenderMessage } from './render-message'
// import { ToolSection } from './tool-section' // Commented out: Depends on @ai-sdk/react data structure
import { Spinner } from './ui/spinner' // Corrected path
import { cn } from '@/lib/utils' // Import cn

interface ChatMessagesProps {
  messages: Message[]
  // data: JSONValue[] | undefined // Commented out: Not available from ai/react useChat
  // onQuerySelect: (query: string) => void // Commented out: Handled differently or not needed?
  isLoading: boolean
  // chatId?: string // Commented out: Not directly used in adapted version?
  // addToolResult?: (params: { toolCallId: string; result: any }) => void // Commented out: Specific to @ai-sdk/react
}

export function ChatMessages({
  messages,
  // data, // Commented out
  // onQuerySelect, // Commented out
  isLoading,
  // chatId, // Commented out
  // addToolResult // Commented out
}: ChatMessagesProps) {
  // const [openStates, setOpenStates] = useState<Record<string, boolean>>({}) // Commented out: Related to collapsible sections based on @ai-sdk/react data
  // const manualToolCallId = 'manual-tool-call' // Commented out

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: messages.length > 5 ? 'instant' : 'smooth'
    })
  }

  useEffect(() => {
    scrollToBottom()
    let intervalId: ReturnType<typeof setInterval> | undefined
    // Simplified loading check for scroll
    if (isLoading && messages.length > 0 && messages[messages.length - 1]?.role !== 'assistant') {
      intervalId = setInterval(scrollToBottom, 100)
    }
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [messages.length, isLoading, messages])

  // Commenting out state management and logic related to @ai-sdk/react specifics like tool calls, annotations, parts etc.
  // useEffect(() => {
  //   const lastMessage = messages[messages.length - 1]
  //   if (lastMessage?.role === 'user') {
  //     setOpenStates({ [manualToolCallId]: true })
  //   }
  // }, [messages])

  // const lastToolData = useMemo(() => {
  //   // ... logic dependent on data structure from @ai-sdk/react
  // }, [data])

  if (!messages || messages.length === 0) return null

  // const lastUserIndex = messages.length - 1 - [...messages].reverse().findIndex(msg => msg.role === 'user') // Commented out: Used for open state logic

  // Simplified loading: Show spinner if isLoading is true and last message isn't from assistant
  const showLoading = isLoading && messages.length > 0 && messages[messages.length - 1]?.role !== 'assistant'

  // Commented out state accessors
  // const getIsOpen = (id: string) => {
  //   // ... logic dependent on openStates and message structure
  // }
  // const handleOpenChange = (id: string, open: boolean) => {
  //   setOpenStates(prev => ({ ...prev, [id]: open }))
  // }

  return (
    <div className="relative mx-auto px-4 w-full">
      {messages.map(message => (
        <div 
          key={message.id} 
          className={cn(
            "mb-4 flex flex-col gap-4", // Existing classes
            message.role === 'user' ? 'items-end' : 'items-start' // Apply alignment
          )}
        >
          <RenderMessage
            message={message}
            // Pass simplified props based on ai/react
            // messageId={message.id}
            // getIsOpen={() => true} // Always open for now
            // onOpenChange={() => {}} // No-op for now
            // onQuerySelect={onQuerySelect} // Pass if needed by child
            // chatId={chatId}
            // addToolResult={addToolResult}
          />
        </div>
      ))}
      {showLoading && (
        // Simply show spinner if loading, removed tool logic
        <Spinner />
      )}
      <div ref={messagesEndRef} />
    </div>
  )
} 