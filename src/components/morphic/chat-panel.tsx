'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { DefaultSkeleton } from './default-skeleton'
import { SearchSection } from './search-section'
import { RelatedQuestions } from './related-questions'
import { Spinner } from './ui/spinner'

interface ChatPanelProps {
  isLoading: boolean
  input: string
  setInput: (val: string) => void
  onSubmit: () => void
}

export function ChatPanel({ isLoading, input, setInput, onSubmit }: ChatPanelProps) {
  const [showSearch, setShowSearch] = useState(false)
  const [showRelated, setShowRelated] = useState(false)

  return (
    <div className={cn('p-4 border-t flex-none')}>
      {/* Toggle buttons */}
      <div className="flex items-center space-x-2 mb-2">
        <button
          type="button"
          className="px-2 py-1 bg-gray-200 rounded"
          onClick={() => setShowSearch(v => !v)}
        >
          🔍 Search
        </button>
        <button
          type="button"
          className="px-2 py-1 bg-gray-200 rounded"
          onClick={() => setShowRelated(v => !v)}
        >
          📄 Related
        </button>
      </div>

      {/* Panels with skeleton loaders */}
      {showSearch && (
        <DefaultSkeleton>
          <SearchSection query={input} />
        </DefaultSkeleton>
      )}
      {showRelated && (
        <DefaultSkeleton>
          <RelatedQuestions query={input} />
        </DefaultSkeleton>
      )}

      {/* The main input form */}
      <form
        className="flex gap-2"
        onSubmit={e => {
          e.preventDefault()
          onSubmit()
        }}
      >
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message…"
          className="flex-1 px-3 py-2 border rounded"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className={cn(
            'px-4 py-2 rounded',
            isLoading || !input.trim()
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-600 text-white'
          )}
        >
          {isLoading ? <Spinner /> : 'Send'}
        </button>
      </form>
    </div>
  )
}