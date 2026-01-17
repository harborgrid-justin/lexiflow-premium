import { GeminiService } from '@/services/features/research/geminiService';
import { type ResearchSession, type UserId } from '@/types';

export const performSearch = async (query: string, history: ResearchSession[]): Promise<{ newSession: ResearchSession, updatedHistory: ResearchSession[] }> => {
    if (!query.trim()) {
        throw new Error("Query is empty");
    }

    const result = await GeminiService.conductResearch(query);
    
    const newSession: ResearchSession = {
      id: Date.now().toString(),
      userId: 'current-user' as UserId, 
      query,
      response: result.text,
      sources: result.sources,
      timestamp: new Date().toLocaleTimeString()
    };

    const updatedHistory = [newSession, ...history];
    return { newSession, updatedHistory };
};

