import { supabase } from '../utils/supabase';
import { ChatSession } from '../types/chatTypes';

export class ChatSessionService {
  static async createChatSession(userId: string, title?: string) {
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({
        user_id: userId,
        title: title || 'New Chat',
        last_message_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  //TODO: Add ability to choose chat session through supabase and not just latest one
  static async getChatSessions(userId: string) {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('last_message_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async getChatSessionMessages(chatSessionId: string) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('chat_session_id', chatSessionId)
      .order('created_at');

    if (error) throw error;
    return data;
  }
} 