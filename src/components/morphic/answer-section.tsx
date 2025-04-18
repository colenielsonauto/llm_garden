'use client'

import { CollapsibleMessage } from './collapsible-message'
// import { DefaultSkeleton } from './default-skeleton' // Assuming skeleton exists or is not needed
import { BotMessage } from './message'
import { MessageActions } from './message-actions'

export type AnswerSectionProps = {
  content: string
  // isOpen: boolean // Commented out: Simplified, always open
  // onOpenChange: (open: boolean) => void // Commented out: Simplified, no change handler needed
  chatId?: string // Keep if MessageActions needs it
  showActions?: boolean
}

export function AnswerSection({
  content,
  // isOpen,
  // onOpenChange,
  chatId,
  showActions = true
}: AnswerSectionProps) {
  // const enableShare = process.env.NEXT_PUBLIC_ENABLE_SHARE === 'true' // Keep if MessageActions uses it

  const messageContent = content ? (
    // Wrap existing content in a styled bubble div
    <div className="mr-auto ml-0 mb-2 max-w-[80%] rounded-2xl bg-gray-200/80 px-3 py-3 shadow-md">
      <div className="flex flex-col gap-1">
        <BotMessage message={content} />
        {showActions && (
          <MessageActions
            message={content} // Pass message content
            chatId={chatId}
            // enableShare={enableShare} // Pass if needed
          />
        )}
      </div>
    </div>
  ) : (
    // <DefaultSkeleton /> // Replace with a simple loading or empty state if needed
    <div>Loading...</div>
  )

  return (
    <CollapsibleMessage
      role="assistant"
      isCollapsible={false} // Not collapsible in simplified version
      isOpen={true} // Always open
      // onOpenChange={() => {}} // No-op
      showBorder={false} // Keep style choice
      showIcon={true} // Render assistant icon
    >
      {messageContent}
    </CollapsibleMessage>
  )
} 