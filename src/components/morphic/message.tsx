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
          code: ({ inline, className, children, ...props }) =>
            inline ? (
              <code className={className} {...props}>
                {children}
              </code>
            ) : (
              <CodeBlock
                codeString={String(children).trim()}
                language={(className || '').replace('language-', '')}
              />
            ),
        }}
      >
        {message}
      </ReactMarkdown>
    </div>
  )
}