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

  export interface ContentPart {
    text?: string;
    inlineData?: {
      mimeType: string;
      data: string;
    };
    functionCall?: {
      name: string;
      args: Record<string, unknown>;
    };
    functionResponse?: {
      name: string;
      response: Record<string, unknown>;
    };
  }

  export interface Content {
    role?: string;
    parts: ContentPart[];
  }

  export interface Tool {
    functionDeclarations?: Array<{
      name: string;
      description: string;
      parameters: Schema;
    }>;
  }

  export interface GenerateContentParameters {
      model: string;
      contents: string | Content | Content[];
      config?: {
          systemInstruction?: string;
          topK?: number;
          topP?: number;
          temperature?: number;
          responseMimeType?: string;
          responseSchema?: Schema;
          tools?: Tool[];
          maxOutputTokens?: number;
          thinkingConfig?: { thinkingBudget: number };
          imageConfig?: { aspectRatio?: string; imageSize?: string };
      };
  }

  export interface GroundingChunk {
    web?: {
      uri: string;
      title: string;
    };
  }

  export interface GenerateContentResponse {
    readonly text: string | undefined;
    readonly functionCalls?: Array<{ name: string; args: Record<string, unknown> }>;
    readonly candidates?: Array<{
      content: {
        parts: ContentPart[];
      };
      groundingMetadata?: {
        groundingChunks?: GroundingChunk[];
      };
    }>;
  }
}
