import { google } from '@ai-sdk/google';
import { streamText, tool, convertToModelMessages } from 'ai';
import { z } from 'zod';
import { crmService } from '@/services/crm-service';
import { getSystemPrompt } from '@/services/ai-service';
import { chatService } from '@/services/chat-service';

export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { messages: rawMessages, id: sessionId } = body;

        console.log("Chat API Request Body:", JSON.stringify(body, null, 2));

        if (!rawMessages || !Array.isArray(rawMessages)) {
            console.error("Invalid messages format received:", rawMessages);
            return new Response(JSON.stringify({ error: "Invalid messages format" }), { status: 400 });
        }

        // Convert UI messages to ModelMessages
        const messages = await convertToModelMessages(rawMessages);

        console.log("Chat API processing messages count:", messages.length);

        const modelName = process.env.NEXT_PUBLIC_AI_MODEL || 'gemini-2.5-flash';
        console.log("AI Configuration:", {
            model: modelName,
            hasGoogleKey: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
            hasResendKey: !!process.env.RESEND_API_KEY,
            hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
        });

        const saveLeadParameters = z.object({
            name: z.string().optional().describe('Name of the lead'),
            email: z.string().describe('Email address of the lead'),
            phone: z.string().optional().describe('Phone number'),
            company: z.string().optional().describe('Company name'),
            interest: z.string().optional().describe('What are they interested in? (Audit, PoC, etc.)'),
        });

        // Use provided sessionId or generate a temporary one
        const activeSessionId = sessionId || `session_${Date.now()}`;

        const result = streamText({
            model: google(modelName),
            messages,
            system: getSystemPrompt(),
            onStepFinish: async (event: any) => {
                console.log("Step finished. Tool Calls:", JSON.stringify(event.toolCalls));
            },
            tools: {
                saveLead: tool({
                    description: 'Save a lead\'s contact information and interest. Call this ONLY when you have a valid email address.',
                    parameters: saveLeadParameters,
                    execute: async (args: any) => {
                        console.log("Executing saveLead tool:", args);

                        // Validate email presence again just in case
                        if (!args.email) {
                            return { success: false, message: "Email is missing." };
                        }

                        // Delegate to Service Layer
                        const response = await crmService.saveLead(args);
                        return response;
                    },
                } as any),
            },
            maxSteps: 5,
            onFinish: async (event: any) => {
                console.log("Stream finished. Usage:", event.usage);

                try {
                    // 1. Save the new Assistant Response
                    await chatService.saveMessage({
                        session_id: activeSessionId,
                        role: 'assistant',
                        content: event.text,
                        tokens: event.usage.outputTokens
                    });

                    // 2. Save the User query that triggered this (it's the last message in `messages` which is ModelMessage)
                    const lastUserMessage = messages[messages.length - 1];
                    if (lastUserMessage && lastUserMessage.role === 'user') {
                        let contentStr = "";
                        if (typeof lastUserMessage.content === 'string') {
                            contentStr = lastUserMessage.content;
                        } else if (Array.isArray(lastUserMessage.content)) {
                            // @ts-ignore
                            contentStr = lastUserMessage.content.map(c => c.type === 'text' ? c.text : '').join(' ');
                        }

                        await chatService.saveMessage({
                            session_id: activeSessionId,
                            role: 'user',
                            content: contentStr,
                            tokens: event.usage.inputTokens
                        });
                    }

                } catch (e) {
                    console.error("Failed to save chat history:", e);
                }
            },
        } as any);

        return (result as any).toUIMessageStreamResponse();
    } catch (error) {
        console.error("Chat API Error:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}
