import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Simple protection for the API route
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin123';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');

    if (key !== ADMIN_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Create a server-side admin client to bypass RLS
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        const { data, error } = await supabaseAdmin
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        return NextResponse.json({ leads: data });
    } catch (error) {
        console.error("Failed to fetch leads:", error);
        return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
    }
}
