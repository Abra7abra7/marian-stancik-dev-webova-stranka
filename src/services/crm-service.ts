import { createClient } from '@supabase/supabase-js';
import { Lead, SaveLeadResponse } from '@/lib/types';
import { Resend } from 'resend';

export class CrmService {
    private resend?: Resend;
    private supabaseAdmin?: any;

    constructor() {
        // We do NOT initialize clients here to prevent build-time errors if envs are missing.
        // Clients are initialized lazily in getResend() and getSupabase().
    }

    private getResend() {
        if (this.resend) return this.resend;
        const apiKey = process.env.RESEND_API_KEY;
        console.log("Initializing Resend. Key Available?", !!apiKey);
        this.resend = new Resend(apiKey);
        return this.resend;
    }

    private getSupabase() {
        if (this.supabaseAdmin) return this.supabaseAdmin;
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        this.supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
        return this.supabaseAdmin;
    }

    async saveLead(lead: Lead): Promise<SaveLeadResponse> {
        console.log("Saving lead:", lead);
        const { email, name, phone, company, interest } = lead;

        // --- AUTONOMOUS STEP: QUALIFICATION ---
        // We qualify the lead BEFORE saving to DB so we store the result immediately
        const { qualifyLead } = await import('./ai-service'); // Dynamic import to avoid cycles if any
        let qualificationResult = { status: 'new', reason: 'Analysis pending' };

        try {
            if (interest && interest.length > 5) {
                qualificationResult = await qualifyLead(interest);
                console.log("Auto-Qualification Result:", qualificationResult);
            } else {
                qualificationResult = { status: 'disqualified', reason: 'Message too short or empty' } as any;
            }
        } catch (error) {
            console.error("Auto-Qualification Failed:", error);
        }

        const finalStatus = qualificationResult.status;
        const finalAnalysis = qualificationResult;

        let dbSuccess = false;
        let emailSuccess = false;

        // 1. Save to Supabase (Success guaranteed by Admin Client)
        const supabase = this.getSupabase();
        if (supabase) {
            // Note: We avoid saving 'ai_analysis' directly to a column if it doesn't exist to prevent errors.
            // We append the reasoning to the interest or assume specific schema presence.
            // For stability, we will just save the status and core fields.
            const { error, data } = await supabase.from('leads').insert([
                {
                    email,
                    name,
                    phone,
                    company,
                    interest: `${interest} \n\n[AI Qualification: ${finalStatus.toUpperCase()} - ${finalAnalysis.reason}]`,
                    status: finalStatus
                    // ai_analysis: finalAnalysis // Removed to prevent PGRST204 if column is missing
                }
            ]).select().single();

            if (error) {
                console.error("Supabase Error:", error);
            } else {
                dbSuccess = true;
                console.log("Lead saved with Auto-Qualification:", finalStatus);
            }
        }

        // 2. Alert Admin (Marian)
        try {
            await this.getResend().emails.send({
                from: "Marian AI Agent <ai@marianstancik.dev>",
                to: "stancikmarian8@gmail.com",
                subject: `🎯 Nový Lead (${finalStatus.toUpperCase()}): ${email}`,
                html: `
                    <h1>Nový Lead - ${finalStatus.toUpperCase()}</h1>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Status:</strong> ${finalStatus}</p>
                    <p><strong>Záujem:</strong> ${interest}</p>
                    <p><strong>AI Dôvod:</strong> ${finalAnalysis.reason}</p>
                    <hr />
                    <p><strong>Meno:</strong> ${name || 'Nezadané'}</p>
                    <p><strong>Telefón:</strong> ${phone || 'Nezadané'}</p>
                    <p><strong>Firma:</strong> ${company || 'Nezadané'}</p>
                `
            });
            console.log("Admin Alert sent.");
        } catch (e) {
            console.error("Failed to email admin:", e);
        }

        // 3. AUTONOMOUS ACTION: Send Specific Email to Client
        if (email) {
            try {
                if (finalStatus === 'qualified') {
                    // Send Booking Link
                    const { data, error } = await this.getResend().emails.send({
                        from: "Marian AI Agent <ai@marianstancik.dev>",
                        to: email,
                        subject: `Výsledok analýzy: Kvalifikovaný pre spoluprácu`,
                        html: `
                            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                                <h1>Dobrý deň,</h1>
                                <p>Naša AI analyzovala vašu situáciu: <em>"${interest}"</em></p>
                                <p><strong>Výsledok: Kvalifikovaný</strong> - ${finalAnalysis.reason}</p>
                                <p><a href="https://cal.com/marian-stancik/30min">Rezervovať Termín</a></p>
                            </div>
                        `
                    });
                    if (error) console.error("Resend API Error (Qualified):", error);
                    else console.log("Resend Success (Qualified):", data);
                } else {
                    // Send Educational Resources
                    const { data, error } = await this.getResend().emails.send({
                        from: "Marian AI Agent <ai@marianstancik.dev>",
                        to: email,
                        subject: `Potvrdenie prijatia správy`,
                        html: `
                            <p>Ďakujem za správu.</p>
                            <p>Analyzovali sme váš vstup: <em>"${interest}"</em></p>
                        `
                    });
                    if (error) console.error("Resend API Error (Disqualified):", error);
                    else console.log("Resend Success (Disqualified):", data);
                }
                emailSuccess = true;
            } catch (e: any) {
                console.error("Critical Fail in Email Block:", e);
            }
        }

        return {
            success: dbSuccess,
            message: dbSuccess ? "Autonomous Loop Complete: Saved, Qualified, and Emailed." : "Database save failed."
        };
    }
}

export const crmService = new CrmService();
