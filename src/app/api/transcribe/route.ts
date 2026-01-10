import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-build',
});

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file type (basic)
        if (!file.type.startsWith('audio/')) {
            return NextResponse.json(
                { error: 'Invalid file type. Please upload an audio file.' },
                { status: 400 }
            );
        }

        // OpenAI expects a File object (which standard fetch FormData gives)
        // However, depending on environment, we might need to buffer it. 
        // The OpenAI SDK handles File objects from formData directly in Node env usually.

        console.log(`Transcribing audio file: ${file.name}, size: ${file.size}, type: ${file.type}`);

        // Check for API key at runtime
        if (!process.env.OPENAI_API_KEY) {
            throw new Error("Missing OPENAI_API_KEY environment variable");
        }

        const translation = await openai.audio.transcriptions.create({
            file: file,
            model: 'whisper-1',
            language: 'sk', // Setting Slovak as preferred, or auto-detect
        });

        console.log("Transcription result:", translation.text);

        return NextResponse.json({ text: translation.text });

    } catch (error) {
        console.error('Transcription error:', error);
        return NextResponse.json(
            { error: 'Failed to transcribe audio' },
            { status: 500 }
        );
    }
}
