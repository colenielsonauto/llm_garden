# System Patterns

## Architecture (Current)

-   **Framework**: Next.js (App Router)
-   **Frontend:** `src/app/page.tsx` using React, TypeScript, Shadcn UI, Tailwind CSS.
-   **Chat Interface:** Leverages the Vercel AI SDK `useChat` hook for state and streaming.
-   **Backend API:** Next.js API route (`src/app/api/chat/route.ts`) running on Node.js.
-   **Authentication:** NextAuth.js (`src/app/api/auth/[...nextauth]/route.ts`), enforced via `src/middleware.ts`.
-   **LLM Interaction:** Backend API directly calls the relevant LLM provider's API (OpenAI, Grok, Gemini) using their SDKs or `fetch`.
-   **Web Search (Planned):** Backend API will conditionally call Google Custom Search API before the LLM call if requested by the frontend.
-   **Streaming:** Backend manually creates a `ReadableStream`, formats chunks using AI SDK Data Format (`0:"<text>"\n`), and sends it to the frontend.

## Data Flow (Chat with Web Search Enabled)

`UI (page.tsx)` -> `useChat Hook (with useWebSearch: true)` -> `fetch ('/api/chat')` -> `API Route (route.ts)` -> `Google Custom Search API` -> `Format Results` -> `Augment Prompt` -> `Provider SDK/API (OpenAI/Grok/Gemini)` -> `Provider API` -> `Stream Response` -> `API Route` -> `Format Stream (AI SDK)` -> `UI`

## Key Technical Decisions

-   Use Next.js App Router.
-   Use Vercel AI SDK `useChat` hook on the frontend.
-   Handle LLM provider logic directly in the backend API route.
-   Manually format backend stream output for frontend compatibility.
-   Use NextAuth.js for authentication.
-   Integrate web search via Google Custom Search API, invoked server-side.

_Updated based on project review. Expand with details on state management, error handling patterns, etc._ 