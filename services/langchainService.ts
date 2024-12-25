import OpenAI from 'openai';
import { supabase } from '../utils/supabase';
import { useState, useEffect } from 'react';
import { ChatMessage } from '../types/chatTypes';
import { ChatSessionService } from './chatSession';
import { useNutritionContext } from './nutritionContext';

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export class LangchainService {
  private static BASE_PROMPT = `You are a knowledgeable nutrition coach assistant helping users track their meals and reach their fitness goals.`;

  private static PROMPTS = {
    text: `${this.BASE_PROMPT} Provide specific, actionable nutrition advice based on the user's question.`,
    
    image: `${this.BASE_PROMPT} Analyze this meal image and provide:
    1. Estimated calories
    2. Macronutrient breakdown (protein, carbs, fat)
    3. Brief nutritional assessment
    4. Suggestions for improvement if needed`,
    
    food_log: `${this.BASE_PROMPT} Review this food log entry and provide:
    1. Confirmation of the logged nutrition values
    2. How this fits into their daily goals
    3. Brief feedback on meal composition
    4. Suggestions for future meals`,
    
    goal_check: `${this.BASE_PROMPT} Analyze their progress towards nutrition goals:
    1. Compare current intake vs goals
    2. Identify trends and patterns
    3. Provide specific adjustments if needed
    4. Offer encouragement and actionable next steps`,
    
    suggestion_request: `${this.BASE_PROMPT} Provide personalized meal suggestions considering:
    1. Their remaining macro/calorie targets for the day
    2. Previous meal patterns
    3. Stated preferences and restrictions
    4. Quick and practical options`
  };

  static async routeRequest(
    type: 'text' | 'image' | 'food_log' | 'goal_check' | 'suggestion_request',
    payload: any
  ) {
    const messages: ChatMessage[] = [
      { 
        role: 'system', 
        content: this.PROMPTS[type]
      },
      {
        role: 'user',
        content: typeof payload === 'string' ? payload : JSON.stringify(payload)
      }
    ];

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages,
        temperature: 0.7,
        max_tokens: 500,
      });

      return completion.choices[0].message;

    } catch (error) {
      console.error('LLM Error:', error);
      throw error;
    }
  }
}

// Hook for managing langchain state
export const useLangchainState = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentChatSessionId, setCurrentChatSessionId] = useState<string | null>(null);
  const nutritionContext = useNutritionContext();

  const initializeChatSession = async (userId: string) => {
    const chatSession = await ChatSessionService.createChatSession(userId);
    setCurrentChatSessionId(chatSession.id);
    return chatSession.id;
  };

  const loadChatSession = async (chatSessionId: string) => {
    const messages = await ChatSessionService.getChatSessionMessages(chatSessionId);
    setMessages(messages);
    setCurrentChatSessionId(chatSessionId);
  };

  const sendMessage = async (contentOrType: string, content?: any) => {
    if (!contentOrType) return;
    
    setIsLoading(true);
    try {
      // If only one parameter, treat it as content with type 'text'
      const type = content ? contentOrType : 'text';
      const messageContent = content || contentOrType;

      console.log(`Sending message of type: ${type}`);
      console.log('Content:', messageContent);

      const userMessage: ChatMessage = { role: 'user', content: messageContent };
      setMessages(currentMessages => [...currentMessages, userMessage]);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active auth session');

      const chatSessionId = currentChatSessionId || await initializeChatSession(session.user.id);

      console.log('Requesting AI response...');
      const aiResponse = await LangchainService.routeRequest(type as any, messageContent);
      console.log('AI Response:', aiResponse);

      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: aiResponse.content || ''
      };
      
      setMessages(currentMessages => [...currentMessages, aiMessage]);

      console.log('Saving messages to Supabase...');
      await supabase
        .from('chat_messages')
        .insert([
          {
            chat_session_id: chatSessionId,
            role: 'user',
            content: userMessage.content,
            created_at: new Date().toISOString()
          },
          {
            chat_session_id: chatSessionId,
            role: 'assistant',
            content: aiResponse.content,
            created_at: new Date().toISOString()
          }
        ]);

      console.log('Messages saved successfully');

    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    sendMessage,
    isLoading,
    currentChatSessionId,
    initializeChatSession,
    loadChatSession
  };
};
