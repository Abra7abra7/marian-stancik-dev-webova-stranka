import { NextResponse } from 'next/server';
import { crmService } from '@/services/crm-service';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, message, recordingUrl } = body;

        console.log("Voice Contact Request:", { email });

        if (!email || !message) {
            return NextResponse.json(
                { error: 'Email and message are required' },
                { status: 400 }
            );
        }

        // Call the CRM service directly to save and qualify the lead
        // This handles DB saving, AI qualification, and sending emails to both Admin and User
        const result = await crmService.saveLead({
            email,
            interest: `Voice Inquiry: ${message}`,
            name: 'Voice User'
        });

        if (result.success) {
            return NextResponse.json(result);
        } else {
            console.error("CRM Service failed:", result);
            // Even if DB fails, we try to proceed or return error. 
            // crmService.saveLead usually returns success: false if DB insert fails.
            return NextResponse.json(
                { error: 'Failed to process inquiry' },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error("Voice Contact API Error:", error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
