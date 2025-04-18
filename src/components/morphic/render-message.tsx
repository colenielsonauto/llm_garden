import { Message } from 'ai/react' // Use ai/react Message type
// import { JSONValue, ToolInvocation } from 'ai' // Types might differ or not be needed
// import { useMemo } from 'react'
import { AnswerSection } from './answer-section'
// import { ReasoningSection } from './reasoning-section' // Commented out: Depends on @ai-sdk/react data structure
// import RelatedQuestions from './related-questions' // Commented out: Depends on annotations
// import { ToolSection } from './tool-section' // Commented out: Depends on @ai-sdk/react data structure
import { UserMessage } from './user-message' // Assuming user-message exists

interface RenderMessageProps {
  message: Message
  // Props related to @ai-sdk/react features removed/commented
  // messageId: string
  // getIsOpen: (id: string) => boolean
  // onOpenChange: (id: string, open: boolean) => void
  // onQuerySelect: (query: string) => void
  // chatId?: string
  // addToolResult?: (params: { toolCallId: string; result: any }) => void
}

export function RenderMessage({
  message
  // messageId,
  // getIsOpen,
  // onOpenChange,
  // onQuerySelect,
  // chatId,
  // addToolResult
}: RenderMessageProps) {
  // Removed memoized logic for relatedQuestions, toolData, reasoningAnnotation as they depend on @ai-sdk/react message structure (annotations, parts)

  if (message.role === 'user') {
    return <UserMessage message={message.content} />
  }

  if (message.role === 'assistant') {
    // Simplified rendering: Directly use AnswerSection for assistant messages
    // Assuming AnswerSection is adapted to just take content
    return (
      <AnswerSection
        content={message.content}
        // isOpen={true} // Defaulting to open
        // onOpenChange={() => {}} // No-op
        // chatId={chatId} // Pass if needed
        showActions={true} // Assuming actions are desired
      />
    )
  }

  // Handle other roles if necessary, or return null
  return null

  // Original logic based on message.parts and annotations (Commented out)
  /*
  return (
    <>
      {toolData.map(tool => (
        <ToolSection ... />
      ))}
      {message.parts?.map((part, index) => {
        const isLastPart = index === (message.parts?.length ?? 0) - 1
        switch (part.type) {
          case 'tool-invocation':
            return (
              <ToolSection ... />
            )
          case 'text':
            return (
              <AnswerSection
                key={`${messageId}-text-${index}`}
                content={part.text}
                isOpen={getIsOpen(messageId)}
                onOpenChange={open => onOpenChange(messageId, open)}
                chatId={chatId}
                showActions={isLastPart}
              />
            )
          case 'reasoning':
            return (
              <ReasoningSection ... />
            )
          default:
            return null
        }
      })}
      {relatedQuestions && relatedQuestions.length > 0 && (
        <RelatedQuestions ... />
      )}
    </>
  )
  */
} 