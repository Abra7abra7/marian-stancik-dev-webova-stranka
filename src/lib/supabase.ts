import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Ensure we don't crash during build time if envs are missing
export const supabase = (supabaseUrl && supabaseKey)
    ? createClient(supabaseUrl, supabaseKey)
    : null;

if (!supabase && typeof window !== 'undefined') {
    console.warn("Supabase credentials missing. Check .env.local");
}
