# Active Context (as of current session)

## Current Work Focus

-   Successfully refactored the `/api/chat` endpoint to use the standard `openai` Node.js library, removing Vercel AI SDK backend components.
-   Implemented correct stream formatting (`0:"<text>"\n`) required by the frontend `useChat` hook.
-   Confirmed chat functionality works for OpenAI models (`gpt-4.5-preview`, `gpt-4o`).
-   Implementing user authentication using email/password.
-   Structuring the app with a dedicated `/login` page and main chat interface at `/`.
-   Implementing a temporary "Demo Login" bypass for testing.

## Recent Changes

-   Replaced Vercel AI SDK's `streamText` and `createOpenAI` with `openai.chat.completions.create`.
-   Switched from Edge Runtime to default Node.js runtime for the API route.
-   Manually implemented stream-to-response conversion using `ReadableStream`.
-   Added AI SDK Data Format prefixes to the stream chunks.
-   Updated error handling for `OpenAI.APIError`.
-   Added the `auth-form.tsx` component using `npx shadcn@latest add`.
-   Modified `src/app/page.tsx` to render the `GridAuth` component, replacing the previous chat interface.
-   Created `/login/page.tsx` to render the `auth-form.tsx` component.
-   Restored the chat interface code to `/page.tsx`.
-   Added a simulated authentication check in `/page.tsx` using `localStorage` and `useRouter` to redirect unauthenticated users to `/login`.
-   Added a "Demo Login (Bypass)" button to `auth-form.tsx` that sets a `localStorage` flag (`demoLoggedIn=true`) and redirects to `/`.

## Next Steps

-   Prepare the `/api/chat` endpoint structure for integrating additional LLM providers (Grok, Claude, etc.).
-   Await specific details (API endpoints, SDKs, authentication, key names) for the new providers.
-   Implement the actual authentication logic (backend API for login/signup, password hashing, session management).
-   Replace the `localStorage` check in `/page.tsx` with real session validation.
-   Replace the "Demo Login" button functionality with actual user login.
-   Store user credentials securely (e.g., database).
-   Potentially add user registration (sign up) functionality to the auth form and backend.

## Active Decisions/Considerations

-   Login page is at `/login`.
-   Main chat interface is at `/` and requires authentication (currently simulated).
-   Using `localStorage` for temporary demo authentication bypass.
-   Using the Shadcn UI component (`https://21st.dev/r/vaib215/auth-form`) as the base for the login/signup form.
-   The frontend will continue using the Vercel AI SDK's `useChat` hook, requiring the backend to send streams in the AI SDK Data Format.
-   The backend needs a flexible way to map model IDs to provider-specific logic and credentials. 