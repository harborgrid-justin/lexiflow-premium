import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { ParsedDocket, SearchResult } from "../types";
import { Prompts } from "./ai/prompts";
import { AnalyzedDocSchema, BriefCritiqueSchema, IntentResultSchema, DocketSchema, ShepardizeSchema } from "./ai/schemas";
import { safeParseJSON } from "../utils/apiUtils";
import { AnalyzedDoc, ResearchResponse, IntentResult, BriefCritique, GroundingChunk, ShepardizeResult } from '../types/ai';

export * from '../types/ai';

export const GeminiService = {
    async analyzeDocument(content: string): Promise<AnalyzedDoc> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: Prompts.Analysis(content),
            config: {
                responseMimeType: 'application/json',
                responseSchema: AnalyzedDocSchema
            }
        });
        
        if (!response.text) throw new Error("No response text from Gemini");
        return safeParseJSON(response.text, { summary: "Analysis failed", riskScore: 0 });
    },

    async critiqueBrief(text: string): Promise<BriefCritique> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: Prompts.Critique(text),
            config: {
                responseMimeType: 'application/json',
                responseSchema: BriefCritiqueSchema
            }
        });

        if (!response.text) throw new Error("No response text from Gemini");
        return safeParseJSON(response.text, {
            score: 0,
            strengths: [],
            weaknesses: ["Analysis unavailable"],
            suggestions: [],
            missingAuthority: []
        });
    },

    async reviewContract(text: string): Promise<string> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: Prompts.Review(text)
        });
        return response.text || "Error reviewing contract.";
    },

    async *streamDraft(context: string, type: string): AsyncGenerator<string, void, unknown> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const responseStream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: Prompts.Draft(context, type)
        });
        for await (const chunk of responseStream) {
            const c = chunk as GenerateContentResponse;
            if (c.text) yield c.text;
        }
    },

    async refineTimeEntry(desc: string): Promise<string> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: Prompts.Refine(desc)
        });
        return response.text || desc;
    },

    async generateDraft(prompt: string, type: string): Promise<string> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: Prompts.Draft(prompt, type)
        });
        return response.text || "Error generating content.";
    },

    async predictIntent(query: string): Promise<IntentResult> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: Prompts.Intent(query),
            config: {
                responseMimeType: 'application/json',
                responseSchema: IntentResultSchema
            }
        });
        
        if (!response.text) throw new Error("No response text from Gemini");
        return safeParseJSON(response.text, { action: 'UNKNOWN', confidence: 0 });
    },

    async parseDocket(text: string): Promise<Partial<ParsedDocket>> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: Prompts.Docket(text),
            config: {
                responseMimeType: 'application/json',
                responseSchema: DocketSchema
            }
        });
        
        if (!response.text) throw new Error("No response text from Gemini");
        return safeParseJSON<Partial<ParsedDocket>>(response.text, {});
    },

    async conductResearch(query: string): Promise<ResearchResponse> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
        return { text: response.text || "No text response.", sources };
    },

    async generateReply(lastMsg: string, role: string): Promise<string> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Draft a professional reply to this message from a ${role}: "${lastMsg}"`
        });
        return response.text || "";
    },

    async shepardizeCitation(citation: string): Promise<ShepardizeResult | null> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: Prompts.Shepardize(citation),
            config: {
                responseMimeType: 'application/json',
                responseSchema: ShepardizeSchema
            }
        });

        if (!response.text) return null;
        return safeParseJSON<ShepardizeResult>(response.text, null);
    },
    
    // Removed getResolutionForError to prevent circular dependency and simplification
};