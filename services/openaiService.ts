// services/openai.ts
import OpenAI from 'openai';
import { supabase } from '../utils/supabase';
import { useState, useEffect } from 'react';
import { ChatMessage, NutritionContext } from '../types/chatTypes';
import { ChatSessionService } from './chatSession';
import { useNutritionContext } from './nutritionContext';
import { DailyNutritionLogs, DailyNutritionGoals } from '~/types/foodTypes';

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Only if calling directly from frontend
});

export class ChatService {
  private static SYSTEM_PROMPT = `You are a nutrition coach assistant helping users track their meals and reach their fitness goals. 
  Provide specific, actionable advice based on their meal logs and goals.`;

  static async getChatCompletion(
    messages: ChatMessage[],
    nutritionData: {
      dailyNutritionGoals: DailyNutritionGoals | null;
      dailyNutritionLogs: DailyNutritionLogs | null;
    }
  ) {
    const contextualizedMessages: ChatMessage[] = [
      { role: 'system', content: this.SYSTEM_PROMPT },
      {
        role: 'system',
        content: `User's current goals: 
        Daily Calories: ${nutritionData.dailyNutritionGoals?.calories_goal}
        Protein: ${nutritionData.dailyNutritionGoals?.protein_goal}g
        Carbs: ${nutritionData.dailyNutritionGoals?.carbs_goal}g
        Fat: ${nutritionData.dailyNutritionGoals?.fat_goal}g`
      },
      {
        role: 'system',
        content: `User's current overall daily nutrition: 
        Daily Calories: ${nutritionData.dailyNutritionLogs?.calories_consumed}
        Protein: ${nutritionData.dailyNutritionLogs?.protein_consumed}g
        Carbs: ${nutritionData.dailyNutritionLogs?.carbs_consumed}g
        Fat: ${nutritionData.dailyNutritionLogs?.fat_consumed}g`
      },
      {
        role: 'system',
        content: `Recent meals: ${JSON.stringify(nutritionData.dailyNutritionLogs?.meals_data)}`
      },
      ...messages
    ];

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: contextualizedMessages,
        temperature: 0.7,
        max_tokens: 500,
      });

      return completion.choices[0].message;

    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw error;
    }
  }

  static async analyzeMealImage(base64Image: string) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this meal and provide nutritional estimates." },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                }
              }
            ],
          },
        ],
        max_tokens: 300,
      });

      return response.choices[0].message;
    } catch (error) {
      console.error('Vision API Error:', error);
      throw error;
    }
  }
}

// Hook for managing chat state
export const useChatState = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentChatSessionId, setCurrentChatSessionId] = useState<string | null>(null);
  const nutritionContext = useNutritionContext();

  const initializeChatSession = async (userId: string) => {
    const chatSession = await ChatSessionService.createChatSession(userId);
    setCurrentChatSessionId(chatSession.id);
    return chatSession.id;
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    setIsLoading(true);
    try {
      const userMessage: ChatMessage = { role: 'user', content };
      console.log('1. Sending message:', userMessage);
      
      setMessages(currentMessages => {
        const newMessages = [...currentMessages, userMessage];
        console.log('2. Messages after user input:', newMessages);
        return newMessages;
      });

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active auth session');

      // Initialize chat session if needed
      const chatSessionId = currentChatSessionId || await initializeChatSession(session.user.id);
      
      //TODO: Remove this after testing
      console.log('Chat session ID:', chatSessionId);

      // Get AI response
      console.log('Getting AI response...');
      const aiResponse = await ChatService.getChatCompletion(
        [...messages, userMessage],
        {
          dailyNutritionGoals: nutritionContext.dailyNutritionGoals,
          dailyNutritionLogs: nutritionContext.dailyNutritionLogs
        }
      );
      console.log('3. AI Response received:', aiResponse);

      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: aiResponse.content || ''
      };
      
      setMessages(currentMessages => {
        const newMessages = [...currentMessages, aiMessage];
        console.log('4. Messages after AI response:', newMessages);
        return newMessages;
      });

      console.log('Saving messages to Supabase...');
      console.log('Session user ID:', session.user.id);

      // Debug logs for Supabase inserts
      console.log('Inserting messages:', [
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Save messages to Supabase
      const { error } = await supabase
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

      if (error) {
        console.error('Supabase error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      console.log('Messages saved successfully');
      
    } catch (error: any) { // Type assertion to fix the linter error
      console.error('Error sending message:', error);
      if (error.code === '42501') {
        console.error('Row-level security policy violation - check Supabase RLS policies');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loadChatSession = async (chatSessionId: string) => {
    const messages = await ChatSessionService.getChatSessionMessages(chatSessionId);
    setMessages(messages);
    setCurrentChatSessionId(chatSessionId);
  };

  // Log when hook is initialized or messages change
  useEffect(() => {
    console.log('Current messages state:', messages);
  }, [messages]);

  return {
    messages,
    sendMessage,
    isLoading,
    currentChatSessionId,
    loadChatSession,
    initializeChatSession
  };
};