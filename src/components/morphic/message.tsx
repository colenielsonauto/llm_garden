'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeExternalLinks from 'rehype-external-links'
import { CodeBlock } from './ui/codeblock'
import 'katex/dist/katex.min.css'
import { cn } from '@/lib/utils'

export function BotMessage({
  message,
  className,
}: {
  message: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'prose-sm prose-neutral prose-a:text-blue-600 dark:prose-invert',
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[
          [rehypeExternalLinks, { target: '_blank' }],
          rehypeKatex,
        ]}
        components={{
          code: ({ inline, className, children, ...props }) => {
            const content = String(children).trim()

            // Animated cursor placeholder
            if (!inline && content === '▍') {
              return (
                <span className="mt-1 cursor-default animate-pulse">
                  ▍
                </span>
              )
            }

            // Inline code
            if (inline) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              )
            }

            // Fenced code block
            return (
              <CodeBlock
                codeString={content}
                language={(className || '').replace('language-', '')}
              />
            )
          },
        }}
      >
        {message}
      </ReactMarkdown>
    </div>
  )
}