// services/chatContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLangchainState } from './langchainService';
import { supabase } from '../utils/supabase';
import { ChatContextType } from '../types/chatTypes';
import { ChatSessionService } from './chatSession';

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const chatState = useLangchainState();
  const [isSessionModalVisible, setIsSessionModalVisible] = useState(false);

  // Add handleCreateNewSession to the context value
  const contextValue = {
    ...chatState,
    handleCreateNewSession: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const newSession = await ChatSessionService.createChatSession(session.user.id);
        await chatState.loadChatSession(newSession.id);
      }
    },
    isSessionModalVisible,
    setIsSessionModalVisible,
  };

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
    <ChatContext.Provider value={contextValue}>
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