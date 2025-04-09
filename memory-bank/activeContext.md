# Active Context (as of current session)

## Current Work Focus

-   Successfully refactored the `/api/chat` endpoint to use the standard `openai` Node.js library, removing Vercel AI SDK backend components.
-   Implemented correct stream formatting (`0:"<text>"\n`) required by the frontend `useChat` hook.
-   Confirmed chat functionality works for OpenAI models (`gpt-4.5-preview`, `gpt-4o`).

## Recent Changes

-   Replaced Vercel AI SDK's `streamText` and `createOpenAI` with `openai.chat.completions.create`.
-   Switched from Edge Runtime to default Node.js runtime for the API route.
-   Manually implemented stream-to-response conversion using `ReadableStream`.
-   Added AI SDK Data Format prefixes to the stream chunks.
-   Updated error handling for `OpenAI.APIError`.

## Next Steps

-   Prepare the `/api/chat` endpoint structure for integrating additional LLM providers (Grok, Claude, etc.).
-   Await specific details (API endpoints, SDKs, authentication, key names) for the new providers.

## Active Decisions/Considerations

-   The frontend will continue using the Vercel AI SDK's `useChat` hook, requiring the backend to send streams in the AI SDK Data Format.
-   The backend needs a flexible way to map model IDs to provider-specific logic and credentials. 