
import { GoogleGenAI, Type } from "@google/genai";
import { SearchResult } from "../types.ts";

// Always initialize GoogleGenAI with process.env.API_KEY directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const GeminiService = {
  async analyzeDocument(docContent: string): Promise<{ summary: string; riskScore: number }> {
    try {
      // Upgraded to gemini-3-pro-preview for complex legal analysis.
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Analyze legal doc. Summary & Risk (0-100). Content: ${docContent.substring(0, 5000)}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: { 
            type: Type.OBJECT, 
            properties: { 
              summary: { type: Type.STRING }, 
              riskScore: { type: Type.INTEGER } 
            },
            required: ['summary', 'riskScore']
          }
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (e) { 
      console.error("Document analysis failed:", e);
      return { summary: "Error during document analysis.", riskScore: 0 }; 
    }
  },

  async conductResearch(query: string): Promise<{ text: string; sources: SearchResult[] }> {
    try {
      // Using gemini-3-pro-preview for research tasks with search tools.
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview', 
        contents: `Legal research: ${query}`, 
        config: { tools: [{ googleSearch: {} }] }
      });
      
      const sources: SearchResult[] = [];
      // Always extract website URLs from groundingChunks as per Search Grounding guidelines.
      response.candidates?.[0]?.groundingMetadata?.groundingChunks?.forEach((c: any) => {
        if (c.web) {
          sources.push({ 
            title: c.web.title, 
            url: c.web.uri, 
            snippet: "Source found via Google Search grounding." 
          });
        }
      });
      
      return { text: response.text || "No response generated.", sources };
    } catch (e) { 
      console.error("Research failed:", e);
      return { text: "Research failed due to an API error.", sources: [] }; 
    }
  },

  async generateDraft(context: string, type: string): Promise<string> {
    try {
      // Using gemini-3-flash-preview for basic text drafting tasks.
      const response = await ai.models.generateContent({ 
        model: 'gemini-3-flash-preview', 
        contents: `Draft legal ${type}. Context: ${context}` 
      });
      return response.text || "";
    } catch (e) { 
      console.error("Drafting failed:", e);
      return "Draft generation failed."; 
    }
  },

  async generateWorkflow(desc: string): Promise<Array<{title: string, tasks: string[]}>> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview', 
        contents: `Create structured legal workflow: ${desc}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT, 
              properties: { 
                title: { type: Type.STRING }, 
                tasks: { type: Type.ARRAY, items: { type: Type.STRING } } 
              },
              required: ['title', 'tasks']
            } 
          }
        }
      });
      return JSON.parse(response.text || '[]');
    } catch (e) { 
      console.error("Workflow generation failed:", e);
      return []; 
    }
  },

  async reviewContract(content: string): Promise<string> {
    try {
      // Upgraded to gemini-3-pro-preview for thorough contract review.
      const response = await ai.models.generateContent({ 
        model: 'gemini-3-pro-preview', 
        contents: `Review contract. Identify risks and suggest improvements. Content: ${content}` 
      });
      return response.text || "No suggestions provided.";
    } catch (e) { 
      console.error("Contract review failed:", e);
      return "Review failed due to a system error."; 
    }
  },

  async refineTimeEntry(raw: string): Promise<string> {
    try {
      // Using gemini-3-flash-preview for time entry refinement.
      const response = await ai.models.generateContent({ 
        model: 'gemini-3-flash-preview', 
        contents: `Rewrite this legal billing entry to be professional, specific, and value-oriented: "${raw}"` 
      });
      return response.text || raw;
    } catch (e) { return raw; }
  },

  async parseDocket(text: string): Promise<any> {
    try {
      // Using gemini-3-pro-preview for complex data extraction from docket text.
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Parse the following court docket text into structured JSON. Extract the Case Information, Parties, Docket Entries, and any Deadlines or Calendar Events.
        
        Text:
        ${text.substring(0, 15000)}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              caseInfo: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  caseNumber: { type: Type.STRING },
                  court: { type: Type.STRING },
                  judge: { type: Type.STRING }
                },
                required: ['title', 'caseNumber']
              },
              parties: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    role: { type: Type.STRING },
                    type: { type: Type.STRING }
                  },
                  required: ['name', 'role']
                }
              },
              docketEntries: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    date: { type: Type.STRING },
                    description: { type: Type.STRING },
                    entryNumber: { type: Type.STRING }
                  },
                  required: ['date', 'description']
                }
              },
              deadlines: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    date: { type: Type.STRING },
                    title: { type: Type.STRING },
                    type: { type: Type.STRING }
                  },
                  required: ['date', 'title']
                }
              }
            },
            required: ['caseInfo', 'parties', 'docketEntries']
          }
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (e) {
      console.error("Docket parsing failed:", e);
      return null;
    }
  }
};
