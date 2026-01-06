import { supabase } from '@/lib/supabase';
import { Message } from '@/lib/types';

export class ChatService {
    async saveMessage(message: Message) {
        if (!supabase) return;

        try {
            const { error } = await supabase.from('messages').insert([{
                session_id: message.session_id,
                role: message.role,
                content: message.content,
                tokens: message.tokens || 0
            }]);

            if (error) {
                console.error("Failed to save message:", error);
            }
        } catch (e) {
            console.error("ChatService Save Error:", e);
        }
    }

    async saveBatch(messages: Message[]) {
        if (!supabase) return;
        try {
            const { error } = await supabase.from('messages').insert(
                messages.map(m => ({
                    session_id: m.session_id,
                    role: m.role,
                    content: m.content,
                    tokens: m.tokens || 0
                }))
            );
            if (error) console.error("Batch save error:", error);
        } catch (e) {
            console.error("Batch save ex:", e);
        }
    }
}

export const chatService = new ChatService();
