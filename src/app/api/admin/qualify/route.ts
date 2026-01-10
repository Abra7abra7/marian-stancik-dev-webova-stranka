import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { qualifyLead } from '@/services/ai-service';

// Simple protection
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin123';

export async function POST(req: Request) {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');

    // Normalize: Remove all spaces to be lenient
    const normalize = (s: string) => s.replace(/\s+/g, '');

    if (!key || normalize(key) !== normalize(ADMIN_SECRET)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { leadId } = await req.json();

        // Admin Client
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        // 1. Fetch Lead
        const { data: lead, error: fetchError } = await supabaseAdmin
            .from('leads')
            .select('*')
            .eq('id', leadId)
            .single();

        if (fetchError || !lead) {
            return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
        }

        // 2. Qualify
        // Combine interest + summary if available, or just interest
        const textToAnalyze = lead.interest || "No message provided";
        const result = await qualifyLead(textToAnalyze);

        // 3. Update DB
        const { error: updateError } = await supabaseAdmin
            .from('leads')
            .update({
                status: result.status,
                ai_analysis: result, // We assume the DB has a JSONB column 'ai_analysis' or we handle it otherwise. 
                // If Supabase schema is strict, this might fail if column doesn't exist.
                // For now, let's update status. We might need to add the column or store it in metadata.
            })
            .eq('id', leadId);

        if (updateError) {
            // Fallback: If ai_analysis column doesn't exist, just update status
            await supabaseAdmin.from('leads').update({ status: result.status }).eq('id', leadId);
        }

        return NextResponse.json({ success: true, result });

    } catch (error) {
        console.error("Qualify Error:", error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
