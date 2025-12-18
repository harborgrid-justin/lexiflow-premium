
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ParsedDocket, SearchResult } from "../types";
import { Prompts } from "./ai/prompts";
import { AnalyzedDocSchema, BriefCritiqueSchema, IntentResultSchema, DocketSchema, ShepardizeSchema, StrategyGraphSchema, LinterResultSchema } from "./ai/schemas";
import { safeParseJSON, withRetry } from "../utils/apiUtils";
import { AnalyzedDoc, ResearchResponse, IntentResult, BriefCritique, GroundingChunk, ShepardizeResult } from '../types/ai';

export * from '../types/ai';

// Singleton-like accessor to ensure consistent config and prevent unnecessary instantiation overhead
const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const GeminiService = {
    async analyzeDocument(content: string): Promise<AnalyzedDoc> {
        return withRetry(async () => {
            try {
                const response: GenerateContentResponse = await getClient().models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: Prompts.Analysis(content),
                    config: {
                        responseMimeType: 'application/json',
                        responseSchema: AnalyzedDocSchema
                    }
                });
                
                if (!response.text) throw new Error("No response text from Gemini");
                return safeParseJSON(response.text, { summary: "Analysis failed to parse", riskScore: 0 });
            } catch (e) {
                console.error("Gemini Analysis Error:", e);
                return { summary: "Analysis unavailable due to service error.", riskScore: 0 };
            }
        });
    },

    async critiqueBrief(text: string): Promise<BriefCritique> {
        return withRetry(async () => {
            try {
                const response: GenerateContentResponse = await getClient().models.generateContent({
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
            } catch (e) {
                console.error("Gemini Critique Error:", e);
                return { score: 0, strengths: [], weaknesses: ["Service Error"], suggestions: [], missingAuthority: [] };
            }
        });
    },

    async reviewContract(text: string): Promise<string> {
        return withRetry(async () => {
            try {
                const response: GenerateContentResponse = await getClient().models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: Prompts.Review(text)
                });
                return response.text || "Error reviewing contract.";
            } catch (e) {
                return "Contract review service unavailable.";
            }
        });
    },

    async *streamDraft(context: string, type: string): AsyncGenerator<string, void, unknown> {
        try {
            const responseStream = await getClient().models.generateContentStream({
                model: 'gemini-2.5-flash',
                contents: Prompts.Draft(context, type)
            });
            for await (const chunk of responseStream) {
                if (chunk.text) yield chunk.text;
            }
        } catch (e) {
            yield "Error streaming content.";
        }
    },

    async refineTimeEntry(desc: string): Promise<string> {
        return withRetry(async () => {
            try {
                const response: GenerateContentResponse = await getClient().models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: Prompts.Refine(desc)
                });
                return response.text || desc;
            } catch (e) {
                return desc;
            }
        });
    },

    async generateDraft(prompt: string, type: string): Promise<string> {
        return withRetry(async () => {
            try {
                const response: GenerateContentResponse = await getClient().models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: Prompts.Draft(prompt, type)
                });
                return response.text || "Error generating content.";
            } catch(e) {
                return "Generation failed.";
            }
        });
    },

    async predictIntent(query: string): Promise<IntentResult> {
        return withRetry(async () => {
            try {
                const response: GenerateContentResponse = await getClient().models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: Prompts.Intent(query),
                    config: {
                        responseMimeType: 'application/json',
                        responseSchema: IntentResultSchema
                    }
                });
                
                if (!response.text) throw new Error("No response text from Gemini");
                return safeParseJSON(response.text, { action: 'UNKNOWN', confidence: 0 });
            } catch (e) {
                return { action: 'UNKNOWN', confidence: 0 };
            }
        });
    },

    async parseDocket(text: string): Promise<Partial<ParsedDocket>> {
        return withRetry(async () => {
            try {
                const response: GenerateContentResponse = await getClient().models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: Prompts.Docket(text),
                    config: {
                        responseMimeType: 'application/json',
                        responseSchema: DocketSchema
                    }
                });
                
                if (!response.text) throw new Error("No response text from Gemini");
                return safeParseJSON<Partial<ParsedDocket>>(response.text, {});
            } catch(e) {
                console.error("Docket Parse Error", e);
                return {};
            }
        });
    },

    async conductResearch(query: string): Promise<ResearchResponse> {
        return withRetry(async () => {
            try {
                const response: GenerateContentResponse = await getClient().models.generateContent({
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
            } catch (e) {
                return { text: "Research service unavailable.", sources: [] };
            }
        });
    },

    async generateReply(lastMsg: string, role: string): Promise<string> {
        return withRetry(async () => {
            try {
                const response: GenerateContentResponse = await getClient().models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: `Draft a professional reply to this message from a ${role}: "${lastMsg}"`
                });
                return response.text || "";
            } catch (e) {
                return "Unable to generate reply.";
            }
        });
    },

    async shepardizeCitation(citation: string): Promise<ShepardizeResult | null> {
        return withRetry(async () => {
            try {
                const response: GenerateContentResponse = await getClient().models.generateContent({
                    model: 'gemini-3-pro-preview',
                    contents: Prompts.Shepardize(citation),
                    config: {
                        responseMimeType: 'application/json',
                        responseSchema: ShepardizeSchema
                    }
                });
        
                if (!response.text) return null;
                return safeParseJSON<ShepardizeResult>(response.text, null);
            } catch (e) {
                return null;
            }
        });
    },

    // --- NEW FOR LITIGATION BUILDER ---
    async generateStrategyFromPrompt(prompt: string): Promise<{ nodes: any[], connections: any[] } | null> {
        return withRetry(async () => {
            try {
                 const response: GenerateContentResponse = await getClient().models.generateContent({
                    model: 'gemini-3-pro-preview',
                    contents: Prompts.Strategy(prompt),
                    config: {
                        responseMimeType: 'application/json',
                        responseSchema: StrategyGraphSchema
                    }
                });
                if (!response.text) return null;
                return safeParseJSON(response.text, { nodes: [], connections: [] });
            } catch(e) {
                console.error("Gemini Strategy Generation Error:", e);
                return null;
            }
        });
    },

    async lintStrategy(graphData: any): Promise<{ suggestions: any[] } | null> {
        return withRetry(async () => {
            try {
                 const response: GenerateContentResponse = await getClient().models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: Prompts.Lint(JSON.stringify(graphData)),
                    config: {
                        responseMimeType: 'application/json',
                        responseSchema: LinterResultSchema
                    }
                });
                if (!response.text) return null;
                return safeParseJSON(response.text, { suggestions: [] });
            } catch(e) {
                console.error("Gemini Strategy Linter Error:", e);
                return null;
            }
        });
    },
};

