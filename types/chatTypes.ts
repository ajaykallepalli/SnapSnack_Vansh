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
}