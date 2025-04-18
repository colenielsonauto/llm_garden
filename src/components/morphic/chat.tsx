'use client'

import { useChat } from '@ai-sdk/react'
import { Message } from 'ai/react'
import { toast } from 'sonner'
import { ChatMessages } from './chat-messages'
import { ChatPanel } from './chat-panel'

interface ChatProps {
  id: string
  savedMessages?: Message[]
  query?: string
}

export function Chat({
  id,
  savedMessages = [],
  query,
}: ChatProps) {
  // ─── Wire up streaming chat (removed `stream` prop) ─────────────
  const { messages, isLoading, input, setInput, handleSubmit } = useChat({
    api: '/api/chat',
    onError: (e) => toast.error(e.message),
  })

  return (
    <div className="w-full h-full flex flex-col">
      {/* Streamed chat output */}
      <ChatMessages messages={messages} isLoading={isLoading} />

      {/* Input panel */}
      <ChatPanel
        isLoading={isLoading}
        input={input}
        setInput={setInput}
        onSubmit={handleSubmit}
      />
    </div>
  )
}