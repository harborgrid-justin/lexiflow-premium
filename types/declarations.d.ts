
declare module "@google/genai" {
  export class GoogleGenAI {
    constructor(config: { apiKey: string });
    models: {
      generateContent(params: any): Promise<any>;
      generateContentStream(params: any): Promise<any>;
    };
  }
  export enum Type {
    STRING = 'STRING',
    NUMBER = 'NUMBER',
    INTEGER = 'INTEGER',
    BOOLEAN = 'BOOLEAN',
    ARRAY = 'ARRAY',
    OBJECT = 'OBJECT'
  }
  export interface GenerateContentResponse {
    text: string;
    candidates?: any[];
  }
}
