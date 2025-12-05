
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { SearchResult } from "../types";
import { Prompts } from "./ai/prompts";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export interface AnalyzedDoc { summary: string; riskScore: number; }
export interface ResearchResponse { text: string; sources: SearchResult[]; }
export interface WorkflowDraft { title: string; tasks: string[]; }
export interface IntentResult {
    action: 'NAVIGATE' | 'CREATE' | 'SEARCH' | 'ANALYZE' | 'UNKNOWN';
    targetModule?: string; entityId?: string; context?: string; confidence: number;
}
export interface BriefCritique {
    score: number;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    missingAuthority: string[];
}

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try { return await fn(); } 
  catch (error: any) {
    if (retries === 0 || (error.status && error.status !== 429 && error.status < 500)) throw error;
    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(fn, retries - 1, delay * 2);
  }
}

function safeParseJSON<T>(text: string, fallback: T): T {
    try { 
        const cleanText = text.replace(/```json\n|\n```|```/g, '').trim();
        return JSON.parse(cleanText); 
    } 
    catch (e) { 
        console.error("JSON Parse Error", e);
        return fallback; 
    }
}

export const GeminiService = {
    async analyzeDocument(content: string): Promise<AnalyzedDoc> {
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: Prompts.Analysis(content),
                config: { responseMimeType: 'application/json' }
            });
            // FIX: Access the .text property directly instead of calling it as a function.
            return safeParseJSON(response.text, { summary: "Analysis failed", riskScore: 0 });
        } catch (e) {
            console.error(e);
            return { summary: "Error analyzing document", riskScore: 0 };
        }
    },

    async critiqueBrief(text: string): Promise<BriefCritique> {
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: Prompts.Critique(text),
                config: { responseMimeType: 'application/json' }
            });
            // FIX: Access the .text property directly instead of calling it as a function.
            return safeParseJSON(response.text, { 
                score: 0, 
                strengths: [], 
                weaknesses: ["Analysis unavailable"], 
                suggestions: [], 
                missingAuthority: [] 
            });
        } catch (e) {
            console.error(e);
            return { 
                score: 0, 
                strengths: [], 
                weaknesses: ["Service error"], 
                suggestions: [], 
                missingAuthority: [] 
            };
        }
    },

    async reviewContract(text: string): Promise<string> {
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: Prompts.Review(text)
            });
            // FIX: Access the .text property directly instead of calling it as a function.
            return response.text;
        } catch (e) {
            return "Error reviewing contract.";
        }
    },

    async *streamDraft(context: string, type: string): AsyncGenerator<string, void, unknown> {
        try {
            const responseStream = await ai.models.generateContentStream({
                model: 'gemini-2.5-flash',
                contents: Prompts.Draft(context, type)
            });
            for await (const chunk of responseStream) {
                const c = chunk as GenerateContentResponse;
                if (c.text) yield c.text;
            }
        } catch (e) {
            console.error(e);
            yield "Error generating draft.";
        }
    },

    async refineTimeEntry(desc: string): Promise<string> {
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: Prompts.Refine(desc)
            });
            // FIX: Access the .text property directly instead of calling it as a function.
            return response.text;
        } catch (e) {
            return desc;
        }
    },

    async generateDraft(prompt: string, type: string): Promise<string> {
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: Prompts.Draft(prompt, type)
            });
            // FIX: Access the .text property directly instead of calling it as a function.
            return response.text;
        } catch (e) {
            return "Error generating content.";
        }
    },

    async predictIntent(query: string): Promise<IntentResult> {
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: Prompts.Intent(query),
                config: { responseMimeType: 'application/json' }
            });
            // FIX: Access the .text property directly instead of calling it as a function.
            return safeParseJSON(response.text, { action: 'UNKNOWN', confidence: 0 });
        } catch (e) {
            return { action: 'UNKNOWN', confidence: 0 };
        }
    },

    async parseDocket(text: string): Promise<any> {
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: Prompts.Docket(text),
                config: { responseMimeType: 'application/json' }
            });
            // FIX: Access the .text property directly instead of calling it as a function.
            return safeParseJSON(response.text, {});
        } catch (e) {
            return {};
        }
    },

    async conductResearch(query: string): Promise<ResearchResponse> {
        try {
             const response = await ai.models.generateContent({
                 model: 'gemini-2.5-flash',
                 contents: Prompts.Research(query),
                 config: {
                     tools: [{googleSearch: {}}]
                 }
             });
             
             const sources: SearchResult[] = [];
             if (response.candidates && response.candidates[0]?.groundingMetadata?.groundingChunks) {
                 response.candidates[0].groundingMetadata.groundingChunks.forEach((c: any) => {
                     if (c.web) {
                         sources.push({ 
                            id: crypto.randomUUID(),
                            title: c.web.title, 
                            url: c.web.uri 
                         });
                     }
                 });
             }

             // FIX: Access the .text property directly instead of calling it as a function.
             return { text: response.text, sources };
        } catch (e) {
            return { text: "Research unavailable.", sources: [] };
        }
    },

    async generateReply(lastMsg: string, role: string): Promise<string> {
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Draft a professional reply to this message from a ${role}: "${lastMsg}"`
            });
            // FIX: Access the .text property directly instead of calling it as a function.
            return response.text;
        } catch (e) {
            return "";
        }
    }
};