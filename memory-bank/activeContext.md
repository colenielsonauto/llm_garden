# Active Context (as of current session)

## Current Work Focus

-   **Implement Web Search Toggle Functionality:** Integrate the existing UI toggle with backend logic using Google Custom Search API.
    -   Modify frontend (`src/app/page.tsx`) `useChat` hook to send `useWebSearch` flag.
    -   Modify backend (`src/app/api/chat/route.ts`) to:
        -   Receive `useWebSearch` flag.
        -   Conditionally call Google Custom Search API if flag is true.
        -   Format search results.
        -   Augment the LLM prompt with search results before calling the provider (OpenAI, Grok, Gemini).
        -   Handle potential errors during the search.
-   Ensure Google Custom Search API Key and CX ID are correctly configured in `.env.local`.

## Recent Changes (In this session)

-   Reviewed entire project structure and key files (`page.tsx`, `route.ts`, `middleware.ts`, etc.).
-   Identified discrepancies between previous Memory Bank state and actual code.
-   Updated all Memory Bank files (`projectbrief.md`, `productContext.md`, `activeContext.md`, `systemPatterns.md`, `techContext.md`, `progress.md`) to reflect current project state and the web search implementation plan.
-   Added Google Custom Search credentials to `.env.local`.
-   Installed `interactive-icon-cloud` component via `npx shadcn@latest add ...`.
-   Created `src/components/IconCloudLanding.tsx` component using `IconCloud` and a placeholder `Logo` component.
-   Identified that `AnimatedBeam` was used in `src/components/landing-page.tsx` within the `AnimatedBeamSection` component.
-   Replaced `AnimatedBeamSection` with `IconCloudLanding` in `src/components/landing-page.tsx`.
-   Modified `src/components/landing-page.tsx`:
    - Removed left padding in `Navbar` container (`pl-0`) to make logo flush left.
    - Commented out hero tagline paragraph.
    - Commented out "Launch App" text in `Navbar`'s right content button.
    - Set `Navbar` container padding to `px-0` for flush left logo and flush right controls.
    - Commented out hero tagline paragraph (previously done).
    - Removed "Launch App" button entirely from `Navbar` (`rightContent={null}`).
    - Deleted the redundant `<h1>AI GARDEN</h1>` title from the hero section above the icon cloud.
    - Resolved hydration error in `IconCloudLanding` by using `useEffect` and `useState` to render `IconCloud` only on the client-side.

## Next Steps (Implementation Plan)

1.  Modify `src/app/page.tsx` to include `useWebSearch: showSearch` in the `useChat` hook's `body`.
2.  Modify `src/app/api/chat/route.ts`:
    -   Extract `useWebSearch` from the request body.
    -   Add the conditional `if (useWebSearch)` block.
    -   Implement the `fetch` call to the Google Custom Search API within the block.
    -   Add logic to format the results (or error/no results message).
    -   Add logic to prepend the formatted results/message to the last user message content.
3.  Test the web search functionality thoroughly with the toggle ON and OFF.
-4.  (Optional) Completely remove the Launch App button structure from `landing-page.tsx` if layout allows.

## Active Decisions/Considerations

-   Web search uses Google Custom Search API.
-   Search is triggered *before* the LLM call in the backend API.
-   Search results (or status) are prepended to the user's last message as context for the LLM.
-   Using the last user message as the raw search query for simplicity initially.
-   Fetching top 3 results from Google Search.
-   Frontend state `showSearch` controls the feature, passed via `useChat` body.
-   Existing provider logic (OpenAI, Grok, Gemini) remains largely unchanged but receives the potentially augmented prompt.
-   Authentication via NextAuth.js is in place.
-   Landing page animation uses `interactive-icon-cloud` instead of `animated-beam`.
-   Landing page header logo is flush left.
    Landing page header logo is flush left, controls are flush right (`px-0`).
-   Landing page hero tagline is removed.
-   Landing page header "Launch App" button is completely removed.
    Redundant `<h1>AI GARDEN</h1>` hero title removed. 