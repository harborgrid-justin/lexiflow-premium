
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { ParsedDocket, SearchResult } from "../types";
import { Prompts } from "./ai/prompts";

interface GroundingChunk {
    web?: {
        title: string;
        uri: string;
    }
}

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

// --- API Response Schemas ---
const AnalyzedDocSchema = {
    type: Type.OBJECT,
    properties: {
        summary: { type: Type.STRING, description: "A concise summary of the legal document." },
        riskScore: { type: Type.NUMBER, description: "A risk score from 0 to 100." }
    },
    required: ["summary", "riskScore"]
};

const BriefCritiqueSchema = {
    type: Type.OBJECT,
    properties: {
        score: { type: Type.NUMBER, description: "Overall score from 0-100." },
        strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Positive aspects of the brief." },
        weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Areas for improvement." },
        suggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific suggestions for revision." },
        missingAuthority: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Key legal authorities that are missing." }
    },
    propertyOrdering: ["score", "strengths", "weaknesses", "suggestions", "missingAuthority"],
    required: ["score", "strengths", "weaknesses", "suggestions", "missingAuthority"]
};

const IntentResultSchema = {
    type: Type.OBJECT,
    properties: {
        action: { type: Type.STRING, enum: ['NAVIGATE', 'CREATE', 'SEARCH', 'ANALYZE', 'UNKNOWN'] },
        targetModule: { type: Type.STRING },
        entityId: { type: Type.STRING },
        context: { type: Type.STRING },
        confidence: { type: Type.NUMBER }
    },
    required: ["action", "confidence"]
};

const DocketSchema = {
    type: Type.OBJECT,
    properties: {
        caseInfo: {
            type: Type.OBJECT,
            properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING }
            }
        },
        parties: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    role: { type: Type.STRING }
                }
            }
        },
        docketEntries: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    date: { type: Type.STRING },
                    title: { type: Type.STRING }
                }
            }
        }
    },
    required: ["caseInfo", "parties", "docketEntries"]
};


async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try { return await fn(); } 
  catch (error: unknown) {
    const status = (error as { status?: number }).status;
    if (retries === 0 || (status && status !== 429 && status < 500)) throw error;
    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(fn, retries - 1, delay * 2);
  }
}

function safeParseJSON<T>(text: string | undefined, fallback: T): T {
    if (!text) return fallback;
    try { 
        // FIX: The Gemini API may wrap JSON in ```json ... ```. This must be stripped.
        const cleanText = text.replace(/^```(json)?\s*|\s*```$/g, '').trim();
        return JSON.parse(cleanText); 
    } 
    catch (e) { 
        console.error("JSON Parse Error", e, "Raw text:", text);
        return fallback; 
    }
}

export const GeminiService = {
    async analyzeDocument(content: string): Promise<AnalyzedDoc> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        try {
            const response: GenerateContentResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: Prompts.Analysis(content),
                config: { 
                    responseMimeType: 'application/json',
                    responseSchema: AnalyzedDocSchema
                }
            });
            return safeParseJSON(response.text, { summary: "Analysis failed", riskScore: 0 });
        } catch (e) {
            console.error(e);
            return { summary: "Error analyzing document", riskScore: 0 };
        }
    },

    async critiqueBrief(text: string): Promise<BriefCritique> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        try {
            const response: GenerateContentResponse = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: Prompts.Critique(text),
                config: { 
                    responseMimeType: 'application/json',
                    responseSchema: BriefCritiqueSchema
                }
            });
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
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        try {
            const response: GenerateContentResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: Prompts.Review(text)
            });
            return response.text || "Error reviewing contract.";
        } catch (e) {
            return "Error reviewing contract.";
        }
    },

    async *streamDraft(context: string, type: string): AsyncGenerator<string, void, unknown> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        try {
            const response: GenerateContentResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: Prompts.Refine(desc)
            });
            return response.text || desc;
        } catch (e) {
            return desc;
        }
    },

    async generateDraft(prompt: string, type: string): Promise<string> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        try {
            const response: GenerateContentResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: Prompts.Draft(prompt, type)
            });
            return response.text || "Error generating content.";
        } catch (e) {
            return "Error generating content.";
        }
    },

    async predictIntent(query: string): Promise<IntentResult> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        try {
            const response: GenerateContentResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: Prompts.Intent(query),
                config: { 
                    responseMimeType: 'application/json',
                    responseSchema: IntentResultSchema
                }
            });
            return safeParseJSON(response.text, { action: 'UNKNOWN', confidence: 0 });
        } catch (e) {
            return { action: 'UNKNOWN', confidence: 0 };
        }
    },

    async parseDocket(text: string): Promise<Partial<ParsedDocket>> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        try {
            const response: GenerateContentResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: Prompts.Docket(text),
                config: { 
                    responseMimeType: 'application/json',
                    responseSchema: DocketSchema
                }
            });
            return safeParseJSON<Partial<ParsedDocket>>(response.text, {});
        } catch (e) {
            return {};
        }
    },

    async conductResearch(query: string): Promise<ResearchResponse> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        try {
             const response: GenerateContentResponse = await ai.models.generateContent({
                 model: 'gemini-2.5-flash',
                 contents: Prompts.Research(query),
                 config: {
                     tools: [{googleSearch: {}}]
                 }
             });
             
             const sources: SearchResult[] = [];
             if (response.candidates && response.candidates[0]?.groundingMetadata?.groundingChunks) {
                 const chunks = response.candidates[0].groundingMetadata.groundingChunks as unknown as GroundingChunk[];
                 chunks.forEach((c) => {
                     if (c.web) {
                         sources.push({ 
                            id: crypto.randomUUID(),
                            title: c.web.title, 
                            url: c.web.uri 
                         });
                     }
                 });
             }
             return { text: response.text || "No text response.", sources };
        } catch (e) {
            return { text: "Research unavailable.", sources: [] };
        }
    },

    async generateReply(lastMsg: string, role: string): Promise<string> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        try {
            const response: GenerateContentResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Draft a professional reply to this message from a ${role}: "${lastMsg}"`
            });
            return response.text || "";
        } catch (e) {
            return "";
        }
    },
    
    async getResolutionForError(errorMessage: string): Promise<string> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        try {
            const response: GenerateContentResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: Prompts.ErrorResolution(errorMessage),
            });
            return response.text || "Could not determine a resolution.";
        } catch (e) {
            console.error("AI resolution failed", e);
            return "AI analysis is currently unavailable.";
        }
    },
};
