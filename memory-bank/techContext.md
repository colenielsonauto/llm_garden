# Technical Context

## Technologies Used

-   **Framework:** Next.js (App Router)
-   **Language:** TypeScript
-   **UI Libraries/Frameworks:** React, Shadcn UI, Tailwind CSS, Framer Motion
-   **Chat State/Streaming:** Vercel AI SDK (`ai/react`, specifically `useChat` hook)
-   **Authentication:** NextAuth.js (`next-auth`)
-   **Backend Runtime:** Node.js (via Next.js API routes)
-   **LLM SDKs/APIs:**
    -   `openai` (Node.js SDK)
    -   `@google/generative-ai` (Node.js SDK for Gemini)
    -   X.ai API (via `fetch` for Grok)
    -   Google Custom Search API (via `fetch`)
-   **Styling:** Tailwind CSS, PostCSS
-   **Linting/Formatting:** ESLint (likely configured via `eslint.config.mjs`)
-   **Package Manager:** npm (based on `package-lock.json`)

## Development Setup

-   Standard Next.js development server (`npm run dev`).
-   Requires Node.js and npm.
-   Requires population of API keys in `.env.local` (OpenAI, X.ai, Gemini, Google CSE, NextAuth Secret/URL).

## Technical Constraints

-   The frontend `useChat` hook dictates the required stream format (`0:"<text>"\n`) from the `/api/chat` backend.
-   Backend must handle authentication and provider-specific logic (API keys, request/response formats) for each LLM and the search API.
-   NextAuth.js session management influences routing and UI rendering.

## Key Dependencies (from package.json)

-   `next`, `react`, `react-dom`, `typescript`
-   `ai` (Vercel AI SDK)
-   `openai`
-   `@google/generative-ai`
-   `next-auth`
-   `@radix-ui/*` (Shadcn UI primitives)
-   `tailwindcss`, `autoprefixer`, `postcss`
-   `lucide-react` (Icons)
-   `framer-motion` (Animations)
-   `react-markdown`, `remark-gfm` (Markdown rendering)

_Updated based on project review. Add specific versions, build tool details if needed._ 