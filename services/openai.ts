// services/openai.ts
import OpenAI from 'openai';
import { supabase } from '../utils/supabase';
import { useState } from 'react';
import { ChatMessage, NutritionContext } from '../types/chatTypes';
import { ChatSessionService } from './chatSession';

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Only if calling directly from frontend
});

export class ChatService {
  private static SYSTEM_PROMPT = `You are a nutrition coach assistant helping users track their meals and reach their fitness goals. 
  Provide specific, actionable advice based on their meal logs and goals.`;

  static async getChatCompletion(
    messages: ChatMessage[],
    nutritionContext: NutritionContext
  ) {
    // Prepare context-aware messages
    const contextualizedMessages: ChatMessage[] = [
      { role: 'system', content: this.SYSTEM_PROMPT },
      {
        role: 'system',
        content: `User's current goals: 
        Daily Calories: ${nutritionContext.userGoals.calories}
        Protein: ${nutritionContext.userGoals.protein}g
        Carbs: ${nutritionContext.userGoals.carbs}g
        Fat: ${nutritionContext.userGoals.fat}g`
      },
      // Add recent meals context
      {
        role: 'system',
        content: `Recent meals: ${JSON.stringify(nutritionContext.recentMeals)}`
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

  const initializeChatSession = async (userId: string) => {
    const chatSession = await ChatSessionService.createChatSession(userId);
    setCurrentChatSessionId(chatSession.id);
    return chatSession.id;
  };

  const sendMessage = async (content: string) => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active auth session');

      // Initialize chat session if needed
      const chatSessionId = currentChatSessionId || await initializeChatSession(session.user.id);
      
      //TODO: Remove this after testing
      console.log('Chat session ID:', chatSessionId);

      const userMessage: ChatMessage = { role: 'user', content };
      setMessages(prev => [...prev, userMessage]);

      // Get nutrition context
      // TODO: Implement this from supabase
      //const nutritionContext = await fetchUserNutritionContext();
      const nutritionContext: NutritionContext = {
        userGoals: {
          calories: 2000,
          protein: 150,
          carbs: 200,
          fat: 65
        },
        recentMeals: [],
      };

      // Get AI response
      console.log('Getting AI response...');
      const aiResponse = await ChatService.getChatCompletion(
        [...messages, userMessage],
        nutritionContext
      );
      console.log('AI response:', aiResponse);

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

      // Update state with AI response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: aiResponse.content || '' // Ensure content is never null
      } as ChatMessage]); 

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

  return {
    messages,
    sendMessage,
    isLoading,
    currentChatSessionId,
    loadChatSession,
    initializeChatSession
  };
};