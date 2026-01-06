import { google } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { Resend } from 'resend';

export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const { messages: rawMessages } = await req.json();

        // Manual conversion to CoreMessage format compatible with AI SDK v6
        // The client sends 'parts' but the server validator expects 'content' for assistant messages
        const messages = rawMessages.map((m: any) => {
            if (m.role === 'assistant' && m.parts && !m.content) {
                return { ...m, content: m.parts };
            }
            return m;
        });

        console.log("Chat API processing messages count:", messages.length);

        const modelName = process.env.NEXT_PUBLIC_AI_MODEL || 'gemini-2.5-flash';
        console.log("Using model:", modelName);

        const saveLeadParameters = z.object({
            name: z.string().optional().describe('Name of the lead'),
            email: z.string().describe('Email address of the lead'),
            phone: z.string().optional().describe('Phone number'),
            company: z.string().optional().describe('Company name'),
            interest: z.string().optional().describe('What are they interested in? (Audit, PoC, etc.)'),
        });

        const result = streamText({
            model: google(modelName),
            messages,
            system: `You are Michael, a Senior AI Business Development Manager for Marian Stancik.
    
    YOUR GOAL:
    Qualify the lead and book a 15-min call.
    
    RULES:
    - **concise**: Responses must be SHORT (max 3 sentences).
    - **direct**: No "fluff" or generic greetings.
    - **format**: Use bullet points for readability.
    - **action**: Every response must end with a question or call to action.
    
    STRATEGY:
    1. Ask: "What is your biggest operational bottleneck right now?"
    2. Value: "We automated that for a client -> saved 20k/year."
    3. Close: "Let's discuss details. What is your email?"
    
    TOOLS:
    - Call \`saveLead\` IMMEDIATELY when you get contact info.
    - Confirm with: "Thanks, Marian will contact you shortly."
    
    TONE: Professional, Brief, Results-Oriented.`,
            tools: {
                saveLead: tool({
                    description: 'Save a lead\'s contact information and interest.',
                    parameters: saveLeadParameters,
                    execute: async (args: any) => {
                        const { name, email, phone, company, interest } = args;
                        console.log("Saving lead:", { email, interest });
                        try {
                            await new Resend(process.env.RESEND_API_KEY).emails.send({
                                from: "AI Agent <onboarding@resend.dev>",
                                to: "marian@stancik.ai",
                                subject: `🎯 Nový Lead z AI Chatu: ${email}`,
                                html: `
                                    <h1>Nový Lead</h1>
                                    <p><strong>Email:</strong> ${email}</p>
                                    <p><strong>Meno:</strong> ${name || 'Nezadané'}</p>
                                    <p><strong>Telefón:</strong> ${phone || 'Nezadané'}</p>
                                    <p><strong>Firma:</strong> ${company || 'Nezadané'}</p>
                                    <p><strong>Záujem:</strong> ${interest || 'Nezadané'}</p>
                                `
                            });
                            return { success: true, message: "Lead saved successfully. Marian has been notified." };
                        } catch (e) {
                            console.error("Failed to email lead:", e);
                            return { success: false, message: "Failed to save lead internally, but captured in chat logs." };
                        }
                    },
                } as any),
            },
            onFinish: (event) => {
                console.log("Stream finished. Usage:", event.usage);
            },
        });

        console.log("StreamText Result Keys:", Object.keys(result));
        // Fallback to toTextStreamResponse as toDataStreamResponse is missing in this env
        return (result as any).toTextStreamResponse();
    } catch (error) {
        console.error("Chat API Error:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}
