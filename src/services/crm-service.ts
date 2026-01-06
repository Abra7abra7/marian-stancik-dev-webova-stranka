import { supabase } from '@/lib/supabase';
import { Lead, SaveLeadResponse } from '@/lib/types';
import { Resend } from 'resend';

export class CrmService {
    private resend: Resend;

    constructor() {
        this.resend = new Resend(process.env.RESEND_API_KEY);
    }

    async saveLead(lead: Lead): Promise<SaveLeadResponse> {
        console.log("Saving lead:", lead);
        const { email, name, phone, company, interest } = lead;

        let dbSuccess = false;
        let emailSuccess = false;

        // 1. Try Saving to Supabase
        if (supabase) {
            const { error } = await supabase.from('leads').insert([
                { email, name, phone, company, interest }
            ]);

            if (error) {
                console.error("Supabase Error:", error);
            } else {
                dbSuccess = true;
                console.log("Lead saved to Supabase");
            }
        } else {
            console.warn("Supabase not initialized, skipping DB save.");
        }

        // 2. Send Notification Email (Backup & Alerting)
        try {
            await this.resend.emails.send({
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
                    <p><strong>Status DB:</strong> ${dbSuccess ? "Uložené" : "CHYBA UKLADANIA"}</p>
                `
            });
            emailSuccess = true;
        } catch (e) {
            console.error("Failed to email lead:", e);
        }

        // 3. Send Confirmation Email to Client (Lead)
        if (email) {
            try {
                await this.resend.emails.send({
                    from: "AI Agent <onboarding@resend.dev>", // Using testing domain to ensure delivery
                    to: email,
                    subject: `Potvrdenie: Vaša žiadosť o konzultáciu`,
                    html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                            <h1>Ďakujem za záujem, ${name || 'Návštevník'}!</h1>
                            <p>Tento email potvrdzuje, že sme prijali Vašu žiadosť o konzultáciu.</p>
                            <p><strong>Zhrnutie Vašich údajov:</strong></p>
                            <ul>
                                <li><strong>Email:</strong> ${email}</li>
                                <li><strong>Záujem:</strong> ${interest || '-'}</li>
                            </ul>
                            <p>Čoskoro sa Vám ozvem (osobne alebo môj tím) s návrhom termínu.</p>
                            <br/>
                            <p>S pozdravom,</p>
                            <p><strong>Marian Stančík & AI Team</strong></p>
                        </div>
                    `
                });
                console.log("Confirmation email sent to client.");
            } catch (e) {
                console.error("Failed to send confirmation email to client:", e);
                // We don't fail the whole process if this fails, just log it
            }
        }

        if (dbSuccess || emailSuccess) {
            return {
                success: true,
                message: "Lead saved successfully. IMPORTANT: You MUST now reply to the user confirming you have their details and will be in touch shortly. Do NOT start a new sentence without acknowledging the save."
            };
        } else {
            return {
                success: false,
                message: "Failed to save lead. Please politely ask the user to provide their email again or try later."
            };
        }
    }
}

export const crmService = new CrmService();
