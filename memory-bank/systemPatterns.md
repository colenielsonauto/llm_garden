# System Patterns

## Architecture (Current)

-   **Frontend:** Next.js application using React.
-   **Chat Interface:** Leverages the Vercel AI SDK `useChat` hook for managing state and streaming.
-   **Backend API:** Next.js API route (`/api/chat`) running on the Node.js runtime.
-   **LLM Interaction:** Backend API directly calls the relevant LLM provider's API (currently OpenAI) using their native SDK.
-   **Streaming:** Backend manually creates a `ReadableStream`, formats chunks using AI SDK Data Format, and sends it to the frontend.

## Key Technical Decisions (Recent)

-   Removed Vercel AI SDK from the backend API route handler.
-   Removed Edge Runtime usage for the chat API route.
-   Adopted direct usage of provider SDKs (starting with `openai`) in the backend.
-   Backend formats stream output to be compatible with the frontend's `useChat` hook requirements.

## Component Relationships

`Chat UI Component` -> `useChat Hook (Vercel AI SDK)` -> `fetch ('/api/chat')` -> `Next.js API Route Handler` -> `Provider SDK (e.g., OpenAI Client)` -> `Provider API`

_This is an initial draft based on the chat endpoint. Please expand with details about other system components, data flow, state management, and overall architectural choices._ 