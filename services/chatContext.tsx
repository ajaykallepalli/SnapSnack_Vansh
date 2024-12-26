// services/chatContext.tsx
import React, { createContext, useContext, useEffect } from 'react';
import { useLangchainState } from './langchainService';
import { supabase } from '../utils/supabase';
import { ChatContextType } from '../types/chatTypes';

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const chatState = useLangchainState();
  
  // Initialize first chat session on mount
  useEffect(() => {
    const initializeFirstSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && !chatState.currentChatSessionId) {
        const { data: sessions } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('user_id', session.user.id)
          .order('last_message_at', { ascending: false })
          .limit(1);

        if (sessions && sessions.length > 0) {
          chatState.loadChatSession(sessions[0].id);
        } else {
          chatState.initializeChatSession(session.user.id);
        }
      }
    };

    initializeFirstSession();
  }, []);

  return (
    <ChatContext.Provider value={chatState}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (undefined === context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}