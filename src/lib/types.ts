export interface Lead {
    id?: string; // Optional because Supabase assigns it
    created_at?: string;
    name?: string;
    email: string;
    phone?: string;
    company?: string;
    interest?: string;
    status?: 'new' | 'contacted' | 'qualified' | 'lost';
}

export interface ChatSession {
    id: string;
    created_at?: string;
    user_email?: string;
    metadata?: Record<string, any>;
}

export type SaveLeadResponse = {
    success: boolean;
    message: string;
};

export interface Message {
    id?: string;
    created_at?: string;
    session_id: string; // Critical for grouping
    role: 'user' | 'assistant' | 'system' | 'data';
    content: string;
    tokens?: number;
}
