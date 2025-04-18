'use client'

// import { CHAT_ID } from '@/lib/constants' // Assuming constants exist - REMOVED as unused
// import { Model } from '@/lib/types/models' // Assuming types exist - COMMENTED OUT as file not found
import { useChat } from '@ai-sdk/react'
import { Message } from 'ai/react'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { ChatMessages } from './chat-messages'
import { ChatPanel } from './chat-panel'

export function Chat({
  id,
  savedMessages = [],
  query,
  // models?: Model[] // COMMENTED OUT as Model type not found
}) {
  const { // Note: This internal useChat might need to be removed/adapted based on final plan
    messages,
    input,
    handleInputChange,
    handleSubmit,
    status,
    setMessages,
    stop,
    append,
    data,
    setData,
    addToolResult
  } = useChat({
    initialMessages: savedMessages,
    // id: CHAT_ID, // Will likely use the passed 'id' prop or configure API route
    body: {
      id
    },
    onFinish: () => {
      // window.history.replaceState({}, '', `/search/${id}`) // Adjust route if needed
    },
    onError: error => {
      toast.error(`Error in chat: ${error.message}`)
    },
    sendExtraMessageFields: false, // Disable extra message fields,
    experimental_throttle: 100
    // api: '/api/chat' // Need to ensure this points to the correct backend
  })

  const isLoading = status === 'submitted' || status === 'streaming'

  useEffect(() => {
    setMessages(savedMessages)
  }, [id])

  const onQuerySelect = (query: string) => {
    append({
      role: 'user',
      content: query
    })
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setData(undefined) // reset data to clear tool call
    handleSubmit(e)
  }

  return (
    <div className="flex flex-col w-full max-w-3xl pt-14 pb-32 mx-auto stretch">
      {/* <ChatMessages
        messages={messages}
        data={data}
        onQuerySelect={onQuerySelect}
        isLoading={isLoading}
        chatId={id}
        addToolResult={addToolResult}
      />
      <ChatPanel
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={onSubmit}
        isLoading={isLoading}
        messages={messages}
        setMessages={setMessages}
        stop={stop}
        query={query}
        append={append}
        // models={models} // COMMENTED OUT as Model type not found
      /> */}
      {/* Placeholder: Components will be rendered here or managed differently based on adaptation plan */}
    </div>
  )
} 