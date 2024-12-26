import OpenAI from 'openai';
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import axios from 'axios';
import { useState, useEffect } from 'react';
import { ChatMessage } from '../types/chatTypes';
import { ChatSessionService } from './chatSession';
import { useNutritionContext } from './nutritionContext';
import { supabase } from '../utils/supabase';

// Initialize logger
const createLogger = (prefix: string) => ({
  info: (...args: any[]) => console.log(`[${prefix}]`, ...args),
  error: (...args: any[]) => console.error(`[${prefix}]`, ...args),
  debug: (...args: any[]) => console.debug(`[${prefix}]`, ...args),
  warn: (...args: any[]) => console.warn(`[${prefix}]`, ...args)
});

const logger = createLogger('LangchainService');

// Message type definitions
type MessageType = 'text' | 'image' | 'food_log' | 'goal_check' | 'suggestion_request';

interface RoutingResponse {
  type: MessageType;
  confidence: number;
  reasoning: string;
}

// Custom Cerebras integration
const createCerebrasRouter = () => {
  const apiKey = process.env.EXPO_PUBLIC_CEREBRAS_API_KEY;
  
  return {
    async invoke({ message }: { message: string }) {
      try {
        const response = await axios.post(
          'https://api.cerebras.ai/v1/generate',
          {
            prompt: message,
            model: 'cerebras/btlm-3b-8k-base',
            temperature: 0
          },
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            }
          }
        );
        return { content: response.data.choices[0].text };
      } catch (error) {
        logger.error('Cerebras API Error:', error);
        throw error;
      }
    }
  };
};

// Initialize models
const openAIRouter = new ChatOpenAI({
  modelName: "gpt-4",
  temperature: 0,
  openAIApiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
});

// Use Cerebras for routing by default, fallback to OpenAI
const routerModel = process.env.EXPO_PUBLIC_CEREBRAS_API_KEY ? createCerebrasRouter() : openAIRouter;

const routerPrompt = PromptTemplate.fromTemplate(`
Classify the user's message into one of these categories:
- text: General conversation or questions
- image: Requests involving image analysis or upload
- food_log: Requests to log food or meals
- goal_check: Questions about nutrition goals or progress
- suggestion_request: Asking for meal or nutrition suggestions

User message: {message}

Return ONLY the category name, nothing else.
`);

const routerChain = routerPrompt.pipe(routerModel);

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export class LangchainService {
  private static BASE_PROMPT = `You are a fitness coach and nutrition expert.`;

  private static ROUTING_PROMPT = `
    As a fitness coach, analyze the user's message and categorize it into one of these types:
    - text: General nutrition questions or statements
    - image: Requests involving meal or food images
    - food_log: Logging or reviewing food entries
    - goal_check: Questions about progress or goal status
    - suggestion_request: Asking for meal or nutrition suggestions

    Respond in JSON format with:
    {
      "type": "one of the above types",
      "confidence": "number between 0 and 1",
      "reasoning": "brief explanation of the categorization"
    }
  `;

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

  static async routeMessage(content: string): Promise<RoutingResponse> {
    logger.info('Routing message:', { content: content.substring(0, 100) + '...' });
    
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: 'system', content: this.ROUTING_PROMPT },
          { role: 'user', content }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      });

      const response = JSON.parse(completion.choices[0].message.content || '{}');
      logger.debug('Routing response:', response);

      return response as RoutingResponse;
    } catch (error) {
      logger.error('Error routing message:', error);
      // Default to text type if routing fails
      return {
        type: 'text',
        confidence: 0.5,
        reasoning: 'Fallback due to routing error'
      };
    }
  }

  static async routeRequest(type: MessageType, payload: any) {
    logger.info('Processing request:', { type, payloadLength: JSON.stringify(payload).length });
    
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
      logger.debug('Sending request to OpenAI:', { messages });
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages,
        temperature: 0.7,
        max_tokens: 500,
      });

      logger.debug('Received response from OpenAI:', { 
        response: completion.choices[0].message.content?.substring(0, 100) + '...'
      });

      return completion.choices[0].message;

    } catch (error) {
      logger.error('Error processing request:', error);
      throw error;
    }
  }
}

// Enhanced hook for managing langchain state
export const useLangchainState = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentChatSessionId, setCurrentChatSessionId] = useState<string | null>(null);
  const nutritionContext = useNutritionContext();
  
  const logger = createLogger('LangchainHook');

  const initializeChatSession = async (userId: string) => {
    logger.info('Initializing chat session for user:', userId);
    const chatSession = await ChatSessionService.createChatSession(userId);
    setCurrentChatSessionId(chatSession.id);
    return chatSession.id;
  };

  const loadChatSession = async (chatSessionId: string) => {
    logger.info('Loading chat session:', chatSessionId);
    const messages = await ChatSessionService.getChatSessionMessages(chatSessionId);
    setMessages(messages);
    setCurrentChatSessionId(chatSessionId);
    logger.debug('Loaded messages:', { count: messages.length });
  };

  const sendMessage = async (content: string) => {
    if (!content) return;
    
    setIsLoading(true);
    logger.info('Starting message processing');

    try {
      // First, route the message
      const routingResult = await LangchainService.routeMessage(content);
      logger.info('Message routed:', routingResult);

      const userMessage: ChatMessage = { role: 'user', content };
      setMessages(currentMessages => [...currentMessages, userMessage]);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        logger.error('No active auth session');
        throw new Error('No active auth session');
      }

      const chatSessionId = currentChatSessionId || await initializeChatSession(session.user.id);
      logger.debug('Using chat session:', chatSessionId);

      // Process with determined type
      const aiResponse = await LangchainService.routeRequest(routingResult.type, content);
      logger.info('Received AI response for type:', routingResult.type);

      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: aiResponse.content || ''
      };
      
      setMessages(currentMessages => [...currentMessages, aiMessage]);

      logger.debug('Saving messages to database');
      await supabase
        .from('chat_messages')
        .insert([
          {
            chat_session_id: chatSessionId,
            role: 'user',
            content: userMessage.content,
            message_type: routingResult.type,
            created_at: new Date().toISOString()
          },
          {
            chat_session_id: chatSessionId,
            role: 'assistant',
            content: aiResponse.content,
            message_type: routingResult.type,
            created_at: new Date().toISOString()
          }
        ]);

      logger.info('Message processing completed successfully');

    } catch (error) {
      logger.error('Error in message processing:', error);
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