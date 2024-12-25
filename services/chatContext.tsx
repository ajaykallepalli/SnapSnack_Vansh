// services/chatContext.tsx
import React, { createContext, useContext } from 'react';
//import { useChatState } from './openaiService';
import { useLangchainState } from './langchainService';
import { ChatMessage } from '../types/chatTypes';

import { ChatContextType } from '../types/chatTypes';

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const chatState = useLangchainState();
  
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