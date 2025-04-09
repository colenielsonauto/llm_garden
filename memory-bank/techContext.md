# Technical Context

## Technologies Used

-   **Frontend Framework:** Next.js (React)
-   **Language:** TypeScript
-   **UI Libraries:** Vercel AI SDK (`ai/react`, specifically `useChat` hook)
-   **Backend Runtime:** Node.js (via Next.js API routes)
-   **LLM SDKs:** `openai` (currently)
-   **Environment Variables:** Used for API keys (e.g., `OPENAI_API_KEY_4_5`, `OPENAI_API_KEY_4O`) stored in `.env.local`.

## Development Setup

-   Standard Next.js development server (`npm run dev` or `yarn dev`).
-   Requires Node.js and npm/yarn.
-   Requires population of API keys in `.env.local`.

## Technical Constraints

-   The frontend `useChat` hook dictates the required stream format from the backend API.
-   Backend must handle authentication and potential errors for each LLM provider individually.

## Dependencies

-   `next`, `react`, `react-dom`, `typescript`
-   `ai` (for frontend `@ai-sdk/react`)
-   `openai` (for backend)

_This is an initial draft. Please expand with specific versions, build tools, linting/formatting setup, testing frameworks, and any other relevant technical details._ 