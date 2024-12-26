import { supabase } from '../utils/supabase';
import { ChatSession } from '../types/chatTypes';
import Cerebras from '@cerebras/cerebras_cloud_sdk';

const client = new Cerebras({
  apiKey: process.env.EXPO_PUBLIC_CEREBRAS_API_KEY,
});

interface CerebrasResponse {
  choices: Array<{
    message: {
      content: string;
    }
  }>;
}

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

  static async getChatSessions(userId: string) {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('last_message_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async getChatSessionMessages(chatSessionId: string, userId: string) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*, chat_sessions!inner(user_id)')
      .eq('chat_session_id', chatSessionId)
      .eq('chat_sessions.user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data.map(msg => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
      chat_session_id: msg.chat_session_id,
      created_at: msg.created_at
    }));
  }

  static async updateLastMessageTime(sessionId: string, userId: string) {
    const { error } = await supabase
      .from('chat_sessions')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', sessionId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  static async summarizeAndRenameSessions(userId: string) {
    try {
      console.log('Starting summarizeAndRenameSessions for user:', userId);
      
      const { data: sessions, error: sessionsError } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('title', 'New Chat');

      if (sessionsError) {
        console.error('Error fetching sessions:', sessionsError);
        return;
      }

      console.log('Found sessions to rename:', sessions?.length);
      if (!sessions) return;

      // First pass: Delete empty sessions
      for (const session of sessions) {
        try {
          console.log('Checking session for messages:', session.id);
          const { data: messages, error: messagesError } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('chat_session_id', session.id);

          if (messagesError) {
            console.error('Error checking messages:', messagesError);
            continue;
          }

          console.log('Messages found:', messages?.length);
          
          if (!messages || messages.length === 0) {
            console.log('Deleting empty session:', session.id);
            const deleted = await this.deleteSession(session.id);
            
            if (!deleted) {
              console.error('Failed to delete session:', session.id);
              continue;
            }
            
            // Verify deletion with retries
            let retries = 3;
            while (retries > 0) {
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              const { data: verifySession } = await supabase
                .from('chat_sessions')
                .select('*')
                .eq('id', session.id);
                
              if (!verifySession || verifySession.length === 0) {
                console.log('Verified session deletion:', session.id);
                break;
              }
              
              console.error(`Session still exists after deletion (retry ${4-retries}/3):`, session.id);
              retries--;
              
              if (retries === 0) {
                // Force delete one more time
                await supabase
                  .from('chat_sessions')
                  .delete()
                  .eq('id', session.id);
              }
            }
          }
        } catch (error) {
          console.error('Error processing session:', session.id, error);
        }
      }

      // Final verification
      const { data: remainingSessions } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('title', 'New Chat');
        
      console.log('Remaining "New Chat" sessions after cleanup:', remainingSessions?.length);
      if (remainingSessions?.length > 0) {
        console.error('Failed to delete all empty sessions:', remainingSessions);
      }

      // Second pass: Summarize remaining sessions
      // for (const session of sessions) {
      //   try {
      //     const messages = await this.getChatSessionMessages(session.id);
      //     if (messages.length === 0) continue; // Skip if empty after deletions

      //     // Get first 5 messages only
      //     const firstFiveMessages = messages.slice(0, 5);
      //     const messageContent = firstFiveMessages
      //       .map(m => `${m.role}: ${m.content}`)
      //       .join('\n');
          
      //     console.log('Getting summary for session:', session.id);
          
      //     const chatCompletion = await client.chat.completions.create({
      //       messages: [{
      //         role: 'user',
      //         content: `Please provide a brief (3-4 words) title summarizing this conversation:\n${messageContent}`
      //       }],
      //       model: 'llama3.1-8b',
      //       temperature: 0.3,
      //       max_tokens: 10
      //     }) as CerebrasResponse;

      //     const summary = chatCompletion.choices[0]?.message?.content?.trim() || 'Chat Session';
      //     console.log('Generated summary:', summary);

      //     const { error: updateError } = await supabase
      //       .from('chat_sessions')
      //       .update({ title: summary })
      //       .eq('id', session.id);

      //     if (updateError) {
      //       console.error('Error updating session title:', updateError);
      //     } else {
      //       console.log('Successfully updated session title for:', session.id);
      //     }
      //   } catch (error) {
      //     console.error('Error processing session:', session.id, error);
      //   }
      // }
    } catch (error) {
      console.error('Top level error in summarizeAndRenameSessions:', error);
    }
  }

  static async checkRLSAccess(sessionId: string) {
    console.log('Checking RLS access for session:', sessionId);
    
    // 1. Check if we can read the session
    const { data: readSession, error: readError } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();
      
    console.log('Read access:', readSession ? 'Yes' : 'No');
    if (readError) console.error('Read error:', readError);

    // 2. Check if we can delete messages
    const { error: deleteMessagesError } = await supabase
      .from('chat_messages')
      .delete()
      .eq('chat_session_id', sessionId)
      .select(); // Dry run
      
    console.log('Delete messages access:', !deleteMessagesError ? 'Yes' : 'No');
    if (deleteMessagesError) console.error('Delete messages error:', deleteMessagesError);

    // 3. Check if we can delete the session
    const { error: deleteSessionError } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', sessionId)
      .select(); // Dry run
      
    console.log('Delete session access:', !deleteSessionError ? 'Yes' : 'No');
    if (deleteSessionError) console.error('Delete session error:', deleteSessionError);

    return {
      canRead: !!readSession,
      canDeleteMessages: !deleteMessagesError,
      canDeleteSession: !deleteSessionError,
      errors: {
        read: readError,
        deleteMessages: deleteMessagesError,
        deleteSession: deleteSessionError
      }
    };
  }

  static async deleteSession(sessionId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('delete_chat_session', {
        session_id: sessionId,
        user_id: userId
      });

      if (error) {
        console.error('Error in delete_chat_session:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error in deleteSession:', error);
      return false;
    }
  }
} 