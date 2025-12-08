
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ParsedDocket, SearchResult } from "../types";
import { Prompts } from "./ai/prompts";
import { AnalyzedDocSchema, BriefCritiqueSchema, IntentResultSchema, DocketSchema } from "./ai/schemas";
import { safeParseJSON } from "../utils/apiUtils";
import { AnalyzedDoc, ResearchResponse, IntentResult, BriefCritique, GroundingChunk } from '../types/ai';

export * from '../types/ai';

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
            // FIX: Access response.text property directly instead of as a function call.
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
            // FIX: Access response.text property directly instead of as a function call.
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
            // FIX: Access response.text property directly.
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
                // FIX: Access c.text property directly.
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
            // FIX: Access response.text property directly.
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
            // FIX: Access response.text property directly.
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
            // FIX: Access response.text property directly.
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
            // FIX: Access response.text property directly.
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
                     tools: [{googleSearch: {}}],
                 }
             });
             
             const sources: SearchResult[] = [];
             if (response.candidates && response.candidates[0]?.groundingMetadata?.groundingChunks) {
                 const chunks = response.candidates[0].groundingMetadata.groundingChunks as GroundingChunk[];
                 chunks.forEach((c: GroundingChunk) => {
                     if (c.web) {
                         sources.push({
                            id: crypto.randomUUID(),
                            title: c.web.title,
                            url: c.web.uri
                         });
                     }
                 });
             }
             // FIX: Access response.text property directly.
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
            // FIX: Access response.text property directly.
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
            // FIX: Access response.text property directly.
            return response.text || "Could not determine a resolution.";
        } catch (e) {
            console.error("AI resolution failed", e);
            return "AI analysis is currently unavailable.";
        }
    },
};