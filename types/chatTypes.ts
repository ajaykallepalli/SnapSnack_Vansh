export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    chat_session_id?: string;
    created_at?: string;
  }
  
export interface NutritionContext {
    userGoals: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
    recentMeals: Array<{
      name: string;
      timestamp: string;
      nutrients: any;
    }>;
  }
  
export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  last_message_at: string;
}

export interface ChatContextType {
    messages: ChatMessage[];
    sendMessage: (content: string) => Promise<void>;
    isLoading: boolean;
    currentChatSessionId: string | null;
    loadChatSession: (sessionId: string) => Promise<void>;
    initializeChatSession: (userId: string) => Promise<string>;
    handleCreateNewSession: () => Promise<void>;
    isSessionModalVisible: boolean;
    setIsSessionModalVisible: (visible: boolean) => void;
  }