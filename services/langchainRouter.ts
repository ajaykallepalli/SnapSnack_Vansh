// langchainRouter.ts
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { DailyNutritionGoals, DailyNutritionLogs } from "../types/foodTypes";
import { ChatMessage } from "../types/chatTypes";

const routerModel = new ChatOpenAI({
  modelName: "gpt-4o",
  temperature: 0,
  openAIApiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
});

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

const handlers = {
  text: async (message: string, context: NutritionContext) => {
    const prompt = PromptTemplate.fromTemplate(`
      You are a nutrition coach assistant. Respond to the user's message considering their goals and progress:
      Current Goals: {goals}
      Current Progress: {progress}
      
      User message: {message}
    `);

    const chain = prompt.pipe(new ChatOpenAI({ modelName: "gpt-4o", temperature: 0.7, openAIApiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY }));

    const response = await chain.invoke({
      goals: JSON.stringify(context.goals),
      progress: JSON.stringify(context.logs),
      message,
    });

    return response;
  },

  food_log: async (message: string, context: NutritionContext) => {
    const prompt = PromptTemplate.fromTemplate(`
      Extract food logging information from the user's message. Return a JSON object with:
      - food_name
      - estimated_calories
      - estimated_protein
      - estimated_carbs
      - estimated_fat
      - meal_type (breakfast/lunch/dinner/snack)
      
      User message: {message}
    `);

    console.log('🚀 LangchainRouter: Starting food log extraction:', message);
    const chain = prompt.pipe(new ChatOpenAI({ modelName: "gpt-4o", temperature: 0.3, openAIApiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY }));

    return chain.invoke({ message });
  },
};

interface NutritionContext {
  goals: DailyNutritionGoals | null;
  logs: DailyNutritionLogs | null;
}

export class LangchainRouter {
  static async routeAndRespond(
    message: string,
    context: NutritionContext
  ): Promise<ChatMessage> {
    try {
      console.log('🚀 LangchainRouter: Starting message routing:', message);
      const routerResponse = await routerChain.invoke({ message });
      console.log('🔍 Router Chain Response:', routerResponse);
      const messageType = routerResponse.content;
      console.log('📝 LangchainRouter: Classified message type:', messageType);
      
      if (messageType.toString() in handlers) {
        console.log('🎯 LangchainRouter: Handler found, executing...');
        const response = await handlers[messageType.toString() as keyof typeof handlers](message, context);
        console.log('✅ LangchainRouter: Handler response:', response);
        return { role: 'assistant', content: response.content.toString() };
      }
      
      throw new Error(`Unhandled message type: ${messageType}`);
    } catch (error) {
      console.error('❌ LangchainRouter error:', error);
      throw error;
    }
  }
} 