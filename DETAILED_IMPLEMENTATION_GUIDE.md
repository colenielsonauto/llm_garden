# AI Garden × Morphic Streaming Integration – **Detailed Implementation Guide**
*Version 0.1 • 2025‑04‑18*

> **Legend** CLI = terminal command ⊕ = expected output 💡 Tip = best practice

---

## 0 · Preparation
1. **CLI** `git switch -c feat/morphic-streaming`
2. **CLI** `pnpm install`
3. Create `.env.local` with your API keys:
   ```env
   OPENAI_API_KEY=
   TAVILY_API_KEY=
   EXA_API_KEY=
   SEARCH_API=https://api.example.com

	4.	CLI pnpm add remark-math rehype-katex rehype-external-links katex react-syntax-highlighter
	5.	CLI pnpm add -D @types/rehype-katex @types/remark-math @tailwindcss/typography tailwindcss-animate

⸻

1 · Enable Streaming Hooks

1.1 Un‑comment imports

In src/components/morphic/chat.tsx, remove the // before the useChat import.

1.2 Instantiate hook

const { messages, isLoading, input, setInput, handleSubmit } = useChat({
  api: '/api/chat',
  stream: true,
  onError: e => toast.error(e.message),
});

1.3 Render UI

<ChatMessages messages={messages} />
<ChatPanel {...{ isLoading, input, setInput, onSubmit: handleSubmit }} />



⸻

2 · Copy Missing Components

Morphic file	Destination	Notes
components/search-section.tsx	src/components/morphic/search-section.tsx	Needs SearchSkeleton
components/related-questions.tsx	src/components/morphic/related-questions.tsx	Uses useChat({ tools })
components/default-skeleton.tsx	src/components/morphic/default-skeleton.tsx	Generic loader
components/ui/spinner.tsx	src/components/morphic/ui/spinner.tsx	Replace old spinner



⸻

3 · Tailwind Config

Edit tailwind.config.ts:

plugins: [
  require('@tailwindcss/typography'),
  require('tailwindcss-animate'),
],
theme: {
  extend: {
    data: { state: 'state' },
  },
}



⸻

4 · Markdown & KaTeX

In src/components/morphic/message.tsx imports add:

import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

Then update <ReactMarkdown> to:

remarkPlugins={[remarkGfm, remarkMath]}
rehypePlugins={[[rehypeExternalLinks, { target: '_blank' }], rehypeKatex]}

Also add to globals.css:

@import 'katex/dist/katex.min.css';



⸻

5 · Animated Cursor

Before your code‑block renderer in message.tsx, insert:

if (codeContent === '▍') {
  return <span className="mt-1 cursor-default animate-pulse">▍</span>;
}



⸻

6 · CodeBlock Highlighter

In src/components/morphic/ui/codeblock.tsx:

import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import js from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
SyntaxHighlighter.registerLanguage('javascript', js);

Wrap your <code> in:

<SyntaxHighlighter style={vscDarkPlus} language={lang}>
  {code}
</SyntaxHighlighter>



⸻

7 · Backend Updates
	•	In src/app/api/chat/route.ts, accept a tool param and dispatch to your helper.
	•	Add lib/tools/search.ts that uses TAVILY_API_KEY and EXA_API_KEY.

⸻

8 · Testing Matrix

Scenario	Expected Outcome
Plain text	Smooth token‑by‑token streaming
Markdown lists	Valid <ul> inside .prose
LaTeX ($$E=mc^2$$)	Correct KaTeX rendering
Code fence ```js	Prism highlight, no scroll
10 concurrent prompts	Scroll locks at bottom, no duplicates
Offline	Graceful error toast from useChat

Run:

pnpm lint && pnpm typecheck && pnpm dev



⸻

9 · Commit & PR

git add PROJECT_SCOPE.md DETAILED_IMPLEMENTATION_GUIDE.md
git commit -m "docs: add detailed implementation guide"
git push -u origin feat/morphic-streaming



⸻

10 · Deploy & Rollback
	•	Merge PR → Vercel preview → promote
	•	To revert: git revert -m 1 <merge-sha>

⸻

11 · Timeline

D0 branch/deps → D1 hooks → D2 markdown → D3 tools → D4 QA → D5 merge

⸻

12 · File Map

src/components/morphic/
  chat.tsx
  chat-messages.tsx
  search-section.tsx ★
  related-questions.tsx ★
  default-skeleton.tsx ★
  message.tsx
  ui/
    spinner.tsx ★
    codeblock.tsx
    markdown.tsx

End of Guide
