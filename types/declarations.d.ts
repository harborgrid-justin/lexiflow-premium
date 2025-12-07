
declare module "@google/genai" {
  export class GoogleGenAI {
    constructor(config: { apiKey: string });
    models: {
      generateContent(params: GenerateContentParameters): Promise<GenerateContentResponse>;
      generateContentStream(params: GenerateContentParameters): Promise<AsyncIterable<GenerateContentResponse>>;
    };
  }

  export enum Type {
    STRING = 'STRING',
    NUMBER = 'NUMBER',
    INTEGER = 'INTEGER',
    BOOLEAN = 'BOOLEAN',
    ARRAY = 'ARRAY',
    OBJECT = 'OBJECT',
    NULL = 'NULL'
  }

  export interface Schema {
    type: Type;
    properties?: Record<string, Schema>;
    items?: Schema;
    required?: string[];
    description?: string;
    enum?: string[];
    propertyOrdering?: string[];
  }

  export interface GenerateContentParameters {
      model: string;
      contents: any; // Could be string or complex object
      config?: {
          systemInstruction?: string;
          topK?: number;
          topP?: number;
          temperature?: number;
          responseMimeType?: string;
          responseSchema?: Schema;
          tools?: any[];
          // FIX: Add missing config properties based on documentation
          maxOutputTokens?: number;
          thinkingConfig?: { thinkingBudget: number };
          imageConfig?: { aspectRatio?: string; imageSize?: string };
      };
  }
  
  export interface GenerateContentResponse {
    readonly text: string | undefined;
    readonly functionCalls?: { name: string; args: any; }[];
    readonly candidates?: {
      content: {
        parts: any[];
      };
      groundingMetadata?: {
        groundingChunks?: any[];
      };
    }[];
  }
}