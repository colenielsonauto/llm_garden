# Product Context: LLM Chat UI

## Problem Solved

Provides a unified interface to access and compare different LLMs without needing separate tools or platforms for each one. Simplifies testing and interaction with various AI models. Allows optional augmentation of LLM responses with real-time web search results.

## How it Works (High-Level)

-   Users authenticate via a login page (using NextAuth.js).
-   Users select a desired LLM model from a list in the chat UI.
-   Users can optionally toggle a web search feature.
-   Users type messages into a chat input.
-   The frontend sends the message, selected model, and search preference to a backend API endpoint (`/api/chat`).
-   If web search is enabled, the backend first queries the Google Custom Search API.
-   The backend API routes the request (potentially augmented with search results) to the appropriate LLM provider (OpenAI, Grok, Gemini), authenticates, and streams the response back.
-   The frontend displays the streaming response in the chat interface.

## User Experience Goals

-   Fast, responsive streaming of text.
-   Clear indication of which model is being used.
-   Easy switching between models.
-   Seamless integration of web search results when enabled.
-   Reliable error handling and feedback.
-   Secure user login.

_Updated based on project review. Expand with user personas, specific workflows, key features, and desired look and feel._ 