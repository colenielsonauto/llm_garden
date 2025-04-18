'use client'

import { CollapsibleMessage } from './collapsible-message'

interface UserMessageProps {
  message: string
}

export function UserMessage({ message }: UserMessageProps) {
  return (
    <CollapsibleMessage
      role="user"
      isCollapsible={false}
      isOpen={true}
      showBorder={false} // Consistent with AnswerSection
      showIcon={true}
    >
      {/* Apply bubble styling using Tailwind */}
      <div className="ml-auto mr-0 mb-2 max-w-[80%] rounded-2xl bg-blue-500/80 px-3 py-3 text-white shadow-md whitespace-pre-wrap">
          {message}
      </div>
    </CollapsibleMessage>
  )
} 