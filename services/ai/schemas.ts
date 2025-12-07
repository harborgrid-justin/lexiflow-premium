
import { Type } from "@google/genai";

export const AnalyzedDocSchema = {
    type: Type.OBJECT,
    properties: {
        summary: { type: Type.STRING, description: "A concise summary of the legal document." },
        riskScore: { type: Type.NUMBER, description: "A risk score from 0 to 100." }
    },
    required: ["summary", "riskScore"]
};

export const BriefCritiqueSchema = {
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

export const IntentResultSchema = {
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

export const DocketSchema = {
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
