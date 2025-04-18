'use client'

import React from 'react'
import { cn } from '@/lib/utils'
// import 'katex/dist/katex.min.css'
// import rehypeExternalLinks from 'rehype-external-links'
// import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
// import remarkMath from 'remark-math'
import { Citing } from './custom-link'
import { CodeBlock } from './ui/codeblock'
import { MemoizedReactMarkdown } from './ui/markdown'
import { Components } from 'react-markdown'
// import { ReactMarkdownProps } from 'react-markdown/lib/complex-types'

// Define a minimal type for the custom code component props
interface CustomCodeProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  // Add `node` and other props if needed, using `any` for simplicity if types are hard to import
  node?: any;
  [key: string]: any; // Allow other props
}

export function BotMessage({
  message,
  className
}: {
  message: string
  className?: string
}) {
  // Temporarily disable LaTeX check and processing
  const containsLaTeX = false;
  const processedData = message;
  /* Original LaTeX logic:
  const containsLaTeX = /\\[([\s\S]*?)\]|\\(([\s\S]*?)\\)/.test(
    message || ''
  );
  const processedData = preprocessLaTeX(message || '');
  */

  if (containsLaTeX) { // This block will be skipped due to containsLaTeX = false
    return (
      <div className={cn(
        'prose-sm prose-neutral prose-a:text-accent-foreground/50',
        className
      )}>
        <MemoizedReactMarkdown
          // rehypePlugins={[
          //   [rehypeExternalLinks, { target: '_blank' }],
          //   [rehypeKatex]
          // ]} // Temporarily commented out
          // remarkPlugins={[remarkGfm, remarkMath]} // Temporarily commented out
          remarkPlugins={[remarkGfm]} // Only use GFM for now
          // className prop removed
        >
          {processedData}
        </MemoizedReactMarkdown>
      </div>
    )
  }

  return (
    <div className={cn(
      'prose-sm prose-neutral prose-a:text-accent-foreground/50',
      className
    )}>
      <MemoizedReactMarkdown
        // rehypePlugins={[[rehypeExternalLinks, { target: '_blank' }]]} // Temporarily commented out
        remarkPlugins={[remarkGfm]} // Only use GFM for now
        // className prop removed
        components={{
          code({ node, inline, className, children, ...props }: CustomCodeProps) {
            const childArray = React.Children.toArray(children);
            if (childArray.length > 0 && typeof childArray[0] === 'string') {
              let codeContent = childArray[0];
              if (codeContent === '▍') {
                return (
                  <span className="mt-1 cursor-default animate-pulse">▍</span>
                );
              }

              codeContent = codeContent.replace('`▍`', '▍');

              const match = /language-(\w+)/.exec(className || '');

              if (inline) {
                return (
                  <code className={className} {...props}>
                    {codeContent}
                  </code>
                );
              }

              return (
                <CodeBlock
                  key={Math.random()} 
                  language={(match && match[1]) || ''}
                  value={codeContent.replace(/\n$/, '')}
                  {...props}
                />
              );
            }
            return <code className={className} {...props}>{children}</code>;
          },
          a: Citing as Components['a']
        }}
      >
        {message}
      </MemoizedReactMarkdown>
    </div>
  )
}

// stubbed out – remove LaTeX parsing for now
const preprocessLaTeX = (content: string): string => content;

/* Original function commented out:
const preprocessLaTeX = (content: string): string => {
  const blockProcessedContent = content.replace(
    /\\[([\s\S]*?)\]/g,
    (_, equation) => `$$${equation}$$`
  );
  const inlineProcessedContent = blockProcessedContent.replace(
    /\\(([\s\S]*?)\\)/g,
    (_, equation) => `$${equation}$`
  );
  return inlineProcessedContent;
};
*/