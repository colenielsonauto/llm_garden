import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Stream } from 'openai/streaming';
import { ChatCompletionChunk } from 'openai/resources/chat/completions';
import { GoogleGenerativeAI, GenerationConfig, Content } from '@google/generative-ai';
import { trackEvent, getRequestDetails, getUserIdFromSession, EventInput } from '@/lib/tracking';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Define the expected structure for Grok API stream chunks (adjust if needed based on actual API response)
interface GrokChatCompletionChunk {
  choices: Array<{
    delta: {
      content: string | null;
    };
    // Add other potential fields if needed, e.g., index, finish_reason
  }>;
  // Add other potential top-level fields if needed, e.g., id, model
}

// Input message structure from the client
interface InputMessage {
  role: 'user' | 'assistant' | 'system'; 
  content: string;
}

// Define a basic interface for Google Search result items
interface GoogleSearchItem {
  title?: string;
  link?: string;
  snippet?: string;
  // Add other potentially useful fields if needed, e.g., from item.pagemap.cse_image[0].src
}

// Remove Edge Runtime
// export const runtime = 'edge'; 

// Helper to mask API key
const maskApiKey = (key: string | undefined): string => {
  if (!key) return 'undefined';
  return `${key.substring(0, 5)}...${key.substring(key.length - 4)}`;
};

export async function POST(req: NextRequest) {
  let selectedApiKey: string | undefined;
  let requestedModelId: string | undefined;
  let responseStream: ReadableStream<Uint8Array>; // To hold the final stream
  let userId: string | null = null;
  let requestDetails: { ipAddress: string | null; userAgent: string | null } | null = null;

  // Remove debug environment variables logging
  // console.log('[API Debug] Environment variables:', {
  //   OPENAI_API_KEY_4_5_exists: !!process.env.OPENAI_API_KEY_4_5,
  //   OPENAI_API_KEY_4O_exists: !!process.env.OPENAI_API_KEY_4O,
  //   XAI_API_KEY_exists: !!process.env.XAI_API_KEY,
  //   NODE_ENV: process.env.NODE_ENV,
  // });

  try {
    // Get request details early
    requestDetails = getRequestDetails(req);
    
    // Get user session
    // Note: Pass req directly if using edge runtime, otherwise pass req/res objects for node
    // Since we removed edge runtime, we might need to adjust how session is retrieved if req/res are needed
    // For App Router API routes, passing the authOptions directly might work
    const session = await getServerSession(authOptions);
    userId = getUserIdFromSession(session);

    const body = await req.json();
    // Destructure useWebSearch along with messages and model
    const { messages, model, useWebSearch }: { messages: InputMessage[], model: string, useWebSearch?: boolean } = body;
    requestedModelId = model;

    const latestMessageContent = messages?.[messages.length - 1]?.content?.substring(0, 50) + '...' || 'no message content';
    // Log the useWebSearch flag
    console.log('[API Route Start] Received:', { message: latestMessageContent, model: requestedModelId, useWebSearch, userId });

    if (!messages || messages.length === 0 || !requestedModelId) {
      console.error('[API Validation Error] Missing messages or model');
      return NextResponse.json({ error: 'Missing messages or model' }, { status: 400 });
    }

    // --- START: Web Search Logic --- 
    let searchResultsText: string | null = null;
    if (useWebSearch) {
        // Track web search usage
        trackEvent({
            userId,
            eventType: 'feature_use',
            eventData: { feature: 'web_search_initiated', query: messages[messages.length - 1]?.content?.substring(0, 100) }, // Log first 100 chars
            ...requestDetails
        });
        console.log('[API Logic] Web search enabled. Performing search...');
        try {
            const query = messages[messages.length - 1]?.content; // Use last message as query
            if (!query) {
                throw new Error("Cannot perform web search without a query.");
            }

            const apiKey = process.env.GOOGLE_CSE_API_KEY;
            const cx = process.env.GOOGLE_CSE_ID;

            if (!apiKey || !cx) {
                console.error('[API Env Error] Google Custom Search API Key or CX ID missing.');
                throw new Error("Configuration error: Google Custom Search API Key or CX ID is missing.");
            }

            const numResults = 3; // Number of results to fetch
            const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}&num=${numResults}`;
            console.log(`[API Logic] Calling Google Search URL: ${searchUrl.replace(apiKey, '***')}`); // Log URL without key

            const searchResponse = await fetch(searchUrl);
            if (!searchResponse.ok) {
                const errorText = await searchResponse.text();
                console.error(`[API Error] Google Search API Error (${searchResponse.status}): ${errorText}`);
                throw new Error(`Google Search API Error (${searchResponse.status})`); // Don't leak detailed error text potentially
            }

            const searchData = await searchResponse.json();

            if (searchData.items && searchData.items.length > 0) {
                searchResultsText = "Web search results:\n\n";
                // Use the defined interface instead of any
                searchData.items.forEach((item: GoogleSearchItem, index: number) => {
                    // Basic check for title, snippet, link
                    const title = item.title || 'No Title';
                    const snippet = item.snippet || 'No Snippet';
                    const link = item.link || 'No Link';
                    searchResultsText += `${index + 1}. ${title}\n   Snippet: ${snippet.replace(/\n/g, ' ')}\n   URL: ${link}\n\n`; // Replace newlines in snippet
                });
                console.log('[API Logic] Web search successful. Results formatted.');
                trackEvent({
                    userId,
                    eventType: 'feature_use',
                    eventData: { feature: 'web_search_success', resultsCount: searchData.items.length }, 
                    ...requestDetails
                });
            } else {
                console.log('[API Logic] Web search returned no results.');
                searchResultsText = "Web search returned no relevant results.\n\n"; // Inform LLM
                trackEvent({
                    userId,
                    eventType: 'feature_use',
                    eventData: { feature: 'web_search_no_results' }, 
                    ...requestDetails
                });
            }

        } catch (searchError: any) {
            console.error('[API Error] Web search failed:', searchError);
            // Track search error specifically
            trackEvent({
                userId,
                eventType: 'error',
                eventData: {
                    errorType: 'GoogleSearchAPIError',
                    message: searchError instanceof Error ? searchError.message : 'Unknown search error',
                    context: 'Error during Google Search API call'
                },
                ...requestDetails
            });
            // Provide a generic error message to the LLM context
            searchResultsText = "An error occurred during the web search. Proceeding without search results.\n\n";
        }
    }
    // --- END: Web Search Logic ---

    // Augment the last user message if search results exist
    // Create a deep copy to avoid modifying the original messages array if needed elsewhere
    const processedMessages = messages.map(m => ({ ...m })); 
    if (searchResultsText) {
        const lastMessageIndex = processedMessages.length - 1;
        if (processedMessages[lastMessageIndex]?.role === 'user') {
            // Add further revised instructions for the LLM
            processedMessages[lastMessageIndex].content = 
`${searchResultsText}Instructions for AI: 
1. Synthesize an informative answer to the user's query based *only* on the web search results provided above.
2. Use clear language and structure the answer logically with paragraphs separated by a blank line.
3. Bold key terms or entities in your response.
4. Cite the information using bracketed numbers (e.g., [1], [2]) corresponding to the numbered search result(s) used.
5. If the search results do not contain the answer, state that clearly.
6. Do not use prior knowledge.
7. At the very end of your response, include a section titled **Sources:** (exactly like that, bolded).
8. Below the Sources heading, list the URLs for the cited results using a numbered list format. Ensure there is a blank line between each source list item for spacing. Example:
   **Sources:**

   [1] URL of source 1

   [2] URL of source 2

User Query:
${processedMessages[lastMessageIndex].content}`;
            console.log('[API Logic] Augmented last user message with search results and further revised instructions.');
        } else {
            console.warn('[API Logic] Could not augment message: Last message not from user.');
        }
    }

    // --- API Key and Client Setup ---
    // Track model usage before calling the provider
    trackEvent({
        userId,
        eventType: 'feature_use',
        eventData: { model: requestedModelId }, 
        ...requestDetails
    });
    
    if (requestedModelId === 'gpt-4.5-preview' || requestedModelId === 'gpt-4o') {
        // --- OpenAI Handling ---
        if (requestedModelId === 'gpt-4.5-preview') {
            selectedApiKey = process.env.OPENAI_API_KEY_4_5;
            if (!selectedApiKey) throw new Error('Config error: OpenAI 4.5 key missing.');
        } else {
            selectedApiKey = process.env.OPENAI_API_KEY_4O;
            if (!selectedApiKey) throw new Error('Config error: OpenAI 4o key missing.');
        }
        console.log(`[API Key Select] Using OpenAI key for ${requestedModelId}: ${maskApiKey(selectedApiKey)}`);

        const openai = new OpenAI({ apiKey: selectedApiKey });

        console.log(`[API Call Start] Calling OpenAI completions with model: ${requestedModelId}...`);
        const stream: Stream<ChatCompletionChunk> = await openai.chat.completions.create({
            model: requestedModelId,
            // Use the potentially augmented messages
            messages: processedMessages.map(m => ({ role: m.role as 'user' | 'assistant' | 'system', content: m.content })), 
            stream: true,
        });
        console.log('[API Call Success] OpenAI stream initiated.');

        // Convert OpenAI Stream to Vercel AI SDK format ReadableStream
        responseStream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                try {
                    for await (const chunk of stream) {
                        const textChunk = chunk.choices[0]?.delta?.content;
                        if (textChunk) {
                            const formattedChunk = `0:${JSON.stringify(textChunk)}\n`;
                            controller.enqueue(encoder.encode(formattedChunk));
                        }
                    }
                } catch (err) {
                    console.error('[Stream Error] Error processing OpenAI stream:', err);
                    const errorToSend = err instanceof Error ? err : new Error('Failed to process OpenAI stream');
                    controller.error(errorToSend);
                } finally {
                    controller.close();
                    console.log('[Stream End] OpenAI stream controller closed.');
                }
            },
            cancel(reason) {
                console.log('[Stream Cancel] OpenAI stream cancelled:', reason);
            }
        });

    } else if (requestedModelId === 'grok-2' || requestedModelId === 'grok-3') {
        const isGrok3 = requestedModelId === 'grok-3';
        selectedApiKey = isGrok3 ? process.env.XAI_API_KEY_GROK3 : process.env.XAI_API_KEY;
        const keyName = isGrok3 ? 'XAI_API_KEY_GROK3' : 'XAI_API_KEY';

        if (!selectedApiKey) {
            console.error(`[API Env Error] API key for ${requestedModelId} (${keyName}) not found.`);
            throw new Error(`Configuration error: API key for ${requestedModelId} missing.`);
        }
        console.log(`[API Key Select] Using Grok key for ${requestedModelId}: ${maskApiKey(selectedApiKey)}`);

        const grokApiUrl = 'https://api.x.ai/v1/chat/completions';
        const grokHeaders = {
            'Authorization': `Bearer ${selectedApiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream', // Important for streaming
        };
        const grokBody = JSON.stringify({
            model: requestedModelId,
            // Use the potentially augmented messages
            messages: processedMessages.map(m => ({ role: m.role as 'user' | 'assistant' | 'system', content: m.content })),
            stream: true,
        });

        console.log(`[API Call Start] Calling Grok API at ${grokApiUrl} with model: ${requestedModelId}...`);

        const grokResponse = await fetch(grokApiUrl, {
            method: 'POST',
            headers: grokHeaders,
            body: grokBody,
        });

        if (!grokResponse.ok || !grokResponse.body) {
            const errorBody = await grokResponse.text();
            console.error(`[API Call Error] Grok API request failed with status ${grokResponse.status}:`, errorBody);
            throw new Error(`Grok API Error (${grokResponse.status}): ${errorBody || 'Failed to fetch stream'}`);
        }
        console.log('[API Call Success] Grok stream initiated.');

        // Convert Grok fetch Response Stream (ReadableStream<Uint8Array>) to Vercel AI SDK format
        responseStream = new ReadableStream({
            async start(controller) {
                const reader = grokResponse.body!.getReader();
                const decoder = new TextDecoder();
                const encoder = new TextEncoder();
                let buffer = '';

                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) {
                            console.log('[Stream End] Grok stream finished.');
                            break;
                        }
                        // Decode and process potentially incomplete SSE messages
                        buffer += decoder.decode(value, { stream: true });
                        
                        const lines = buffer.split('\n');
                        buffer = lines.pop() || ''; // Keep the potentially incomplete last line

                        for (const line of lines) {
                            if (line.startsWith('data: ')) {
                                const jsonString = line.substring(6).trim();
                                if (jsonString === '[DONE]') {
                                    console.log('[Stream Info] Received [DONE] marker from Grok.');
                                    continue; // Skip the [DONE] marker
                                }
                                try {
                                    const parsedChunk = JSON.parse(jsonString) as GrokChatCompletionChunk;
                                    const textChunk = parsedChunk.choices?.[0]?.delta?.content;
                                    if (textChunk) {
                                        const formattedChunk = `0:${JSON.stringify(textChunk)}\n`;
                                        controller.enqueue(encoder.encode(formattedChunk));
                                    }
                                } catch (parseError) {
                                    console.error('[Stream Error] Failed to parse Grok JSON chunk:', jsonString, parseError);
                                    // Decide how to handle parse errors - continue or error out?
                                    // controller.error(new Error('Failed to parse stream data'));
                                    // return; 
                                }
                            }
                        }
                    }
                } catch (err) {
                    console.error('[Stream Error] Error processing Grok stream:', err);
                    const errorToSend = err instanceof Error ? err : new Error('Failed to process Grok stream');
                    controller.error(errorToSend);
                } finally {
                    // Ensure decoder stream buffer is flushed if needed (usually not necessary here)
                    // const remaining = decoder.decode(); // Flush decoder
                    // Process remaining if any logic is added...
                    controller.close();
                    console.log('[Stream End] Grok stream controller closed.');
                }
            },
            cancel(reason) {
                console.log('[Stream Cancel] Grok stream cancelled:', reason);
                // Add cancellation logic if the fetch API supports AbortController well here
            }
        });

    } else if (requestedModelId === 'gemini-2.0-flash-exp-image-generation' || requestedModelId === 'gemini-2.5-pro-preview-03-25') {
        // --- Gemini Handling ---
        const isFlash = requestedModelId === 'gemini-2.0-flash-exp-image-generation';
        selectedApiKey = isFlash ? process.env.GEMINI_FLASH_API_KEY : process.env.GEMINI_PRO_API_KEY;
        const keyName = isFlash ? 'GEMINI_FLASH_API_KEY' : 'GEMINI_PRO_API_KEY';

        if (!selectedApiKey) {
            console.error(`[API Env Error] API key for ${requestedModelId} (${keyName}) not found.`);
            throw new Error(`Configuration error: API key for ${requestedModelId} missing.`);
        }
        console.log(`[API Key Select] Using Gemini key for ${requestedModelId}: ${maskApiKey(selectedApiKey)}`);

        const genAI = new GoogleGenerativeAI(selectedApiKey);
        const modelInstance = genAI.getGenerativeModel({ model: requestedModelId });

        // Map potentially augmented messages to Gemini format
        const geminiHistory: Content[] = processedMessages
          .filter((msg: InputMessage): msg is InputMessage & { role: 'user' | 'assistant' } => msg.role === 'user' || msg.role === 'assistant') // Filter for user/model roles
          .map((msg) => ({ role: msg.role === 'user' ? 'user' : 'model', parts: [{ text: msg.content }] }));
          
        // Extract the last user message for the current turn (which now contains search results + instructions)
        const currentUserMessage = geminiHistory.pop(); // Remove last message to send separately
        if (!currentUserMessage || currentUserMessage.role !== 'user') {
           console.error('[API Logic Error] Last message was not from user or missing for Gemini after processing');
           throw new Error('Cannot send request to Gemini without a final user message after processing.');
        }

        // TODO: Define appropriate generationConfig based on the specific Gemini model
        const generationConfig: GenerationConfig = {
            // Default config, adjust as needed per model
            temperature: 0.7,
            topP: 0.95,
            // topK: 64, // Example, check defaults/recommendations
            maxOutputTokens: isFlash ? 8192 : 65536, // Use different max tokens
            // responseMimeType: "text/plain", // Only needed if default isn't plain text
        };

        console.log(`[API Call Start] Calling Gemini stream with model: ${requestedModelId}...`);

        const chat = modelInstance.startChat({ history: geminiHistory, generationConfig });
        const streamResult = await chat.sendMessageStream(currentUserMessage.parts);

        console.log('[API Call Success] Gemini stream initiated.');

        // Convert Gemini Stream to Vercel AI SDK format ReadableStream
        responseStream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                try {
                    for await (const chunk of streamResult.stream) {
                        const textChunk = chunk.text(); 
                        if (textChunk) {
                            const formattedChunk = `0:${JSON.stringify(textChunk)}\n`;
                            controller.enqueue(encoder.encode(formattedChunk));
                        }
                    }
                } catch (err) {
                    console.error('[Stream Error] Error processing Gemini stream:', err);
                    const errorToSend = err instanceof Error ? err : new Error('Failed to process Gemini stream');
                    controller.error(errorToSend);
                } finally {
                    controller.close();
                    console.log('[Stream End] Gemini stream controller closed.');
                }
            },
            cancel(reason) {
                console.log('[Stream Cancel] Gemini stream cancelled:', reason);
            }
        });

    } else {
      // Track unsupported model error
      const errorMsg = `Model ${requestedModelId} not supported or accessible`;
      trackEvent({
          userId,
          eventType: 'error',
          eventData: {
              errorType: 'UnsupportedModelError',
              message: errorMsg,
              modelRequested: requestedModelId,
          },
          ...requestDetails
      });
      console.error(`[API Model Error] Unsupported model requested: ${requestedModelId}`);
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    // --- Return the appropriate stream ---
    return new Response(responseStream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      },
    });

  } catch (error: unknown) {
    // Ensure requestDetails are available here if possible, might be null if error happens early
    const safeRequestDetails = requestDetails ?? { ipAddress: null, userAgent: null }; 
    // Log the general API error
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    const stack = error instanceof Error ? error.stack : undefined;
    trackEvent({
        userId, // userId might also be null if session fetch failed
        eventType: 'error',
        eventData: {
            errorType: 'APIHandlerError',
            message,
            stack,
            context: 'General catch block in /api/chat POST handler'
        },
        ...safeRequestDetails
    });

    console.error('[API Route Error] Unhandled error in POST handler:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
} 