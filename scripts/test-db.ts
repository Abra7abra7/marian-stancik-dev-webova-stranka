import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testSupabase() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    console.log("Testing Supabase Connection...");
    console.log("URL:", url ? "Set ✅" : "Missing ❌");
    console.log("KEY:", key ? "Set ✅" : "Missing ❌");

    if (!url || !key) {
        console.error("❌ Credentials missing. Check .env.local");
        process.exit(1);
    }

    const supabase = createClient(url, key);

    try {
        console.log("Attempting to insert test lead...");
        const { data, error } = await supabase.from('leads').insert([{
            email: 'test@example.com',
            name: 'Test Agent',
            interest: 'System Test',
            status: 'new'
        }]).select();

        if (error) {
            console.error("❌ Insert Failed:", error.message);
            console.error("Check your Row Level Security (RLS) policies or Table existence.");
        } else {
            console.log("✅ Insert Successful!", data);

            // Clean up
            console.log("Cleaning up test lead...");
            await supabase.from('leads').delete().eq('email', 'test@example.com');
            console.log("✅ Cleanup Done.");
        }

    } catch (e) {
        console.error("❌ Unexpected Error:", e);
    }
}

testSupabase();
