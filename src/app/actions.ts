"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { Resend } from "resend";
import * as cheerio from "cheerio";

// Initialize APIs
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");
const resend = new Resend(process.env.RESEND_API_KEY);

interface AuditResult {
  success: boolean;
  score?: number;
  teaser?: string;
  error?: string;
}

export async function analyzeWebsite(formData: FormData): Promise<AuditResult> {
  const url = formData.get("url") as string;
  const email = formData.get("email") as string;

  if (!url || !email) {
    return { success: false, error: "Missing URL or Email" };
  }

  try {
    // 1. Scrape Website
    console.log(`Scraping ${url}...`);
    const websiteData = await scrapeWebsite(url);
    if (!websiteData) {
      return { success: false, error: "Failed to load website content." };
    }

    // 2. Parallel Execution: Gemini Analysis + PageSpeed Audit
    console.log("Analyzing with Gemini & PageSpeed...");
    const [aiAnalysis, pageSpeedData] = await Promise.all([
      runGeminiAnalysis(websiteData, url),
      runPageSpeedAudit(url)
    ]);

    // 3. Send Email with Combined Data
    console.log(`Sending email to ${email}...`);
    await sendAuditEmail(email, url, aiAnalysis, pageSpeedData);

    // 4. Return Teaser to Client
    return {
      success: true,
      score: aiAnalysis.score,
      teaser: aiAnalysis.opportunities[0]?.title || "Optimization Opportunity Found",
    };

  } catch (error) {
    console.error("Audit Error:", error);
    return { success: false, error: "Something went wrong during the audit." };
  }
}

// Helper: Scrape Text
async function scrapeWebsite(url: string): Promise<string | null> {
  try {
    // Ensure protocol
    const targetUrl = url.startsWith("http") ? url : `https://${url}`;

    // Using a simple fetch with a browser-like user agent
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000) // 8s timeout
    });

    if (!response.ok) return null;

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove clutter to reduce token usage
    $("script").remove();
    $("style").remove();
    $("nav").remove();
    $("footer").remove();
    $("svg").remove();

    // Get clean text
    const text = $("body").text().replace(/\s+/g, " ").trim();
    return text.slice(0, 8000); // Reasonable context window for Gemini Pro
  } catch (e) {
    console.error("Scrape failed", e);
    return null;
  }
}

// Helper: PageSpeed Insights
async function runPageSpeedAudit(url: string) {
  try {
    const targetUrl = url.startsWith("http") ? url : `https://${url}`;
    // Using public PSI API. Note: This often hits quota limits.
    const psiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(targetUrl)}&strategy=mobile`;

    const res = await fetch(psiUrl, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) {
      // Silently fail for quota/rate limits
      return null;
    }

    const data = await res.json();
    if (data.error) return null;

    return {
      performance: Math.round(data.lighthouseResult.categories.performance.score * 100),
      fcp: data.lighthouseResult.audits['first-contentful-paint'].displayValue,
      lcp: data.lighthouseResult.audits['largest-contentful-paint'].displayValue,
    };
  } catch (e) {
    // Ignore PSI errors (timeouts/quota) to keep the main flow fast
    return null;
  }
}

// Helper: Gemini Analysis
interface AIAnalysis {
  score: number;
  industry: string;
  summary: string;
  opportunities: { title: string; description: string; impact: string }[];
}

async function runGeminiAnalysis(text: string, url: string): Promise<AIAnalysis> {
  // Switched to 'gemini-2.5-flash' as requested by user (minimum 2.5) or use env override
  const modelName = process.env.NEXT_PUBLIC_AI_MODEL || "gemini-2.5-flash";
  const model = genAI.getGenerativeModel({ model: modelName });

  const prompt = `
    You are an expert AI Business Consultant.
    Analyze this website text: "${text.slice(0, 4000)}..."
    
    Output strictly valid JSON (no markdown):
    {
      "score": number (0-100),
      "industry": string (Slovak),
      "summary": string (Slovak, 2 sentences),
      "opportunities": [
        { "title": string (Slovak), "description": string (Slovak), "impact": "High"|"Medium" }
      ]
    }
    Generate exactly 3 opportunities.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();

    const jsonStr = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonStr) as AIAnalysis;
  } catch (e: any) {
    console.error("Gemini Error:", e.message);
    // Fallback response so the user still gets an email
    return {
      score: 0,
      industry: "Neznáme",
      summary: "Ospravedlňujeme sa, AI momentálne nemohla analyzovať túto stránku pre vysoké zaťaženie.",
      opportunities: [
        { title: "Kontaktujte nás", description: "Pre manuálnu analýzu nám napíšte.", impact: "High" }
      ]
    };
  }
}

// Helper: Send Email
async function sendAuditEmail(to: string, url: string, data: AIAnalysis, psi: any) {
  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
      <h1 style="color: #4f46e5;">AI Audit Report: ${url}</h1>
      
      <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin: 20px 0;">
        <h2 style="margin-top: 0;">AI Readiness Score: <span style="color: #4f46e5; font-size: 1.5em;">${data.score}/100</span></h2>
        <p><strong>Odvetvie:</strong> ${data.industry}</p>
        <p>${data.summary}</p>
      </div>

      ${psi ? `
      <div style="background: #eef2ff; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #c7d2fe;">
        <h3 style="margin-top: 0; color: #3730a3;">⚡ Rýchlosť webu (Mobile)</h3>
        <p style="font-size: 2em; font-weight: bold; margin: 10px 0; color: ${psi.performance >= 90 ? '#16a34a' : psi.performance >= 50 ? '#ca8a04' : '#dc2626'}">${psi.performance}/100</p>
        <ul style="padding-left: 20px; color: #4338ca;">
            <li>First Contentful Paint: <strong>${psi.fcp}</strong></li>
            <li>Largest Contentful Paint: <strong>${psi.lcp}</strong></li>
        </ul>
      </div>
      ` : ''}

      <h3>🚀 Príležitosti na automatizáciu</h3>
      ${data.opportunities.map(opp => `
        <div style="border-left: 4px solid #4f46e5; padding-left: 15px; margin-bottom: 20px;">
          <h4 style="margin: 0; color: #1e293b;">${opp.title}</h4>
          <p style="margin: 5px 0 0; color: #475569;">${opp.description}</p>
          <small style="color: #64748b;">Impact: ${opp.impact}</small>
        </div>
      `).join("")}

      <hr style="margin: 40px 0; border: none; border-top: 1px solid #e2e8f0;" />
      
      <p style="text-align: center; color: #64748b; font-size: 12px;">
        Generated by Marian Stancik AI Agent.<br/>
        <a href="mailto:marian@stancik.ai">Odpovedať na tento email</a>
      </p>
    </div>
  `;

  await resend.emails.send({
    from: "AI Agent <onboarding@resend.dev>",
    to: to,
    subject: `🚀 Váš AI Audit Report pre ${url}`,
    html: htmlContent,
  });
}
