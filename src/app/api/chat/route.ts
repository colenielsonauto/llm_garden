import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Stream } from 'openai/streaming';
import { ChatCompletionChunk } from 'openai/resources/chat/completions';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, GenerationConfig, Content, Part } from '@google/generative-ai';

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

// Added type for Gemini API message format
interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
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

  // Remove debug environment variables logging
  // console.log('[API Debug] Environment variables:', {
  //   OPENAI_API_KEY_4_5_exists: !!process.env.OPENAI_API_KEY_4_5,
  //   OPENAI_API_KEY_4O_exists: !!process.env.OPENAI_API_KEY_4O,
  //   XAI_API_KEY_exists: !!process.env.XAI_API_KEY,
  //   NODE_ENV: process.env.NODE_ENV,
  // });

  try {
    const body = await req.json();
    const { messages, model } = body;
    requestedModelId = model;

    const latestMessageContent = messages?.[messages.length - 1]?.content?.substring(0, 50) + '...' || 'no message content';
    console.log('[API Route Start] Received:', { message: latestMessageContent, model: requestedModelId });

    if (!messages || messages.length === 0 || !requestedModelId) {
      console.error('[API Validation Error] Missing messages or model');
      return NextResponse.json({ error: 'Missing messages or model' }, { status: 400 });
    }

    // --- API Key and Client Setup ---
    if (requestedModelId === 'gpt-4.5-preview' || requestedModelId === 'gpt-4o') {
        // --- OpenAI Handling ---
        let openai: OpenAI; // Declare openai here as it's specific to this block
        if (requestedModelId === 'gpt-4.5-preview') {
            selectedApiKey = process.env.OPENAI_API_KEY_4_5;
            if (!selectedApiKey) {
                console.error('[API Env Error] API key for gpt-4.5-preview not found.');
                throw new Error('Configuration error: API key for gpt-4.5-preview missing.');
            }
        } else { // gpt-4o
            selectedApiKey = process.env.OPENAI_API_KEY_4O;
            if (!selectedApiKey) {
                console.error('[API Env Error] API key for gpt-4o not found.');
                throw new Error('Configuration error: API key for gpt-4o missing.');
            }
        }
        console.log(`[API Key Select] Using OpenAI key for ${requestedModelId}: ${maskApiKey(selectedApiKey)}`);

        openai = new OpenAI({ apiKey: selectedApiKey });

        console.log(`[API Call Start] Calling OpenAI completions with model: ${requestedModelId}...`);
        const stream: Stream<ChatCompletionChunk> = await openai.chat.completions.create({
            model: requestedModelId,
            messages: messages,
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

    } else if (requestedModelId === 'grok-2') {
        // --- Grok Handling ---
        // Restore using environment variable
        selectedApiKey = process.env.XAI_API_KEY; // Use XAI_API_KEY
        if (!selectedApiKey) {
            // Restore original error handling
            console.error('[API Env Error] API key for grok-2 (XAI_API_KEY) not found.');
            throw new Error('Configuration error: API key for grok-2 missing.');
        }
        console.log(`[API Key Select] Using Grok key for ${requestedModelId}: ${maskApiKey(selectedApiKey)}`);

        const grokApiUrl = 'https://api.x.ai/v1/chat/completions';
        const grokHeaders = {
            'Authorization': `Bearer ${selectedApiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream', // Important for streaming
        };
        const grokBody = JSON.stringify({
            model: 'grok-2', // Or potentially 'grok-beta' if 'grok-2' fails
            messages: messages,
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

        // Map messages to Gemini format (simple text for now)
        // TODO: Handle multi-modal input if needed in the future
        const geminiHistory: Content[] = messages
          .filter((msg: any) => msg.role === 'user' || msg.role === 'assistant') // Filter system/other roles if necessary
          .map((msg: any) => ({
            role: msg.role === 'user' ? 'user' : 'model', 
            parts: [{ text: msg.content }],
          }));
        
        // Extract the last user message for the current turn
        const currentUserMessage = geminiHistory.pop(); // Remove last message to send separately
        if (!currentUserMessage || currentUserMessage.role !== 'user') {
           console.error('[API Logic Error] Last message was not from user or missing for Gemini');
           throw new Error('Cannot send request to Gemini without a final user message.');
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

        const geminiStream = await modelInstance.generateContentStream({
            contents: [...geminiHistory, currentUserMessage], // Combine history and current message
            generationConfig: generationConfig,
            // safetySettings: [] // Optional: Configure safety settings
        });

        console.log('[API Call Success] Gemini stream initiated.');

        // Convert Gemini Stream to Vercel AI SDK format ReadableStream
        responseStream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                try {
                    for await (const chunk of geminiStream.stream) {
                        // Ensure candidates exist and have content
                        const candidates = chunk.candidates;
                        if (candidates && candidates.length > 0) {
                            // Process all parts within the first candidate's content
                            const content = candidates[0].content;
                            if (content && content.parts && content.parts.length > 0) {
                                content.parts.forEach((part: Part) => {
                                    if (part.text) { // Ensure it's a text part
                                        const formattedChunk = `0:${JSON.stringify(part.text)}\n`;
                                        controller.enqueue(encoder.encode(formattedChunk));
                                    }
                                });
                            }
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
      // --- Unsupported Model ---
      console.error(`[API Model Error] Unsupported model requested: ${requestedModelId}`);
      return NextResponse.json({ error: `Model ${requestedModelId} not supported or accessible` }, { status: 400 });
    }

    // --- Return the appropriate stream ---
    return new Response(responseStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });

  } catch (error: any) {
    console.error('[API Route Error] Raw error object:', error); // Log the raw error first

    let errorDetails = 'An unknown error occurred while processing your request.';
    let statusCode = 500;
    const failedModel = requestedModelId || 'unknown';
    let logMessage = `[API Call Error] Failed for model ${failedModel}.`;

    // Add specific log for gpt-4o failure context
    if (failedModel === 'gpt-4o') {
       console.error(`[API Error Specific] Failure occurred specifically when using gpt-4o with OpenAI client. Raw Error was:`, error);
    }

    // --- Handle OpenAI API Errors --- 
    if (error instanceof OpenAI.APIError) {
        statusCode = error.status || 500;
        // Use the error message directly from OpenAI which is often detailed
        errorDetails = error.message || `OpenAI API Error (Status ${statusCode})`;
        logMessage += ` OpenAI API Error (${error.code || 'no code'}): ${error.message}. Status: ${statusCode}.`;
        console.error(logMessage, 'Full OpenAI Error Details:', JSON.stringify(error, null, 2)); // Log full error 

        // Specific OpenAI error codes/statuses
        if (error.status === 404 || error.code === 'model_not_found') {
            errorDetails = `Model ${failedModel} not found or you do not have access via the provided API key.`;
            statusCode = 400; // Bad request
        } else if (error.status === 401 || error.status === 403 || error.code === 'authentication_error' || error.code === 'invalid_api_key') {
             errorDetails = `Authentication error or permission denied for model ${failedModel}. Check your API key (${maskApiKey(selectedApiKey)}) and ensure it has access granted to the '${failedModel}' model in your OpenAI account settings. Error code: ${error.code || 'N/A'}`;
             statusCode = 401; // Unauthorized
        } else if (error.status === 429 || error.code === 'rate_limit_exceeded') {
             errorDetails = `Rate limit exceeded for model ${failedModel}. Please try again later. Code: ${error.code || 'N/A'}`;
             statusCode = 429;
        } else {
             // Log unexpected OpenAI errors
             console.error(`[API Error Specific] Unexpected OpenAI API error status/code for ${failedModel}:`, error);
        }
    } else if (error.message?.startsWith('Configuration error:')) {
        // Keep handling for missing API keys
        errorDetails = 'Server configuration issue. Please contact the administrator.';
        statusCode = 500;
        logMessage += ` Configuration Error: ${error.message}`;
        console.error(logMessage);
    } else if (error instanceof Error) {
        // Generic errors
        errorDetails = error.message;
        logMessage += ` Generic Error: ${error.message}.`;
        console.error(logMessage, 'Stack:', error.stack);
    } else {
        // Unknown errors
        logMessage += ` Unknown Error Type: ${JSON.stringify(error)}`;
        console.error(logMessage);
    }

    console.error(`[API Error Summary] Model: ${failedModel}, Status: ${statusCode}, Details: ${errorDetails}`); // Log summary before returning

    // --- Return JSON error response ---
    return NextResponse.json({
      error: 'Failed to process request with OpenAI', // Updated error message source
      details: errorDetails,
      modelUsed: failedModel
    }, { status: statusCode });
  }
} 