
import { SchemaType } from "@google/generative-ai";

// Type alias for backward compatibility
const Type = SchemaType;

// Existing Schemas
export const AnalyzedDocSchema = {
    type: Type.OBJECT,
    properties: {
        summary: { type: Type.STRING },
        riskScore: { type: Type.NUMBER }
    },
    required: ["summary", "riskScore"]
};

export const BriefCritiqueSchema = {
    type: Type.OBJECT,
    properties: {
        score: { type: Type.NUMBER },
        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
        weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
        suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
        missingAuthority: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
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
    }
};

// New Schema
export const ShepardizeSchema = {
    type: Type.OBJECT,
    properties: {
        caseName: { type: Type.STRING, description: "The full name of the case." },
        citation: { type: Type.STRING, description: "The full, standardized legal citation." },
        summary: { type: Type.STRING, description: "A brief, one-paragraph summary of the case's core holding." },
        history: {
            type: Type.ARRAY,
            description: "Appellate history of the case.",
            items: {
                type: Type.OBJECT,
                properties: {
                    action: { type: Type.STRING, description: "e.g., 'Affirmed by', 'Reversed by'" },
                    citingCase: { type: Type.STRING, description: "The name of the court or case taking the action." },
                    citingCitation: { type: Type.STRING, description: "The citation for the appellate decision." },
                },
                required: ["action", "citingCase"]
            }
        },
        treatment: {
            type: Type.ARRAY,
            description: "How other cases have treated this case.",
            items: {
                type: Type.OBJECT,
                properties: {
                    treatment: { type: Type.STRING, enum: ['Followed', 'Criticized', 'Distinguished', 'Questioned', 'Mentioned'] },
                    citingCase: { type: Type.STRING, description: "Name of the case that cites the original case." },
                    citingCitation: { type: Type.STRING, description: "Citation for the citing case." },
                    quote: { type: Type.STRING, description: "A relevant quote from the citing case discussing the original case." }
                },
                required: ["treatment", "citingCase", "quote"]
            }
        }
    },
    required: ["caseName", "citation", "summary", "history", "treatment"]
};

// --- NEW SCHEMAS FOR LITIGATION BUILDER ---

export const StrategyGraphSchema = {
  type: Type.OBJECT,
  properties: {
    nodes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          label: { type: Type.STRING },
          type: { type: Type.STRING, enum: ['Task', 'Decision', 'Milestone', 'Event', 'Phase', 'Start', 'End'] },
        }
      }
    },
    connections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          from: { type: Type.STRING },
          to: { type: Type.STRING },
          label: { type: Type.STRING },
        }
      }
    }
  }
};

export const LinterResultSchema = {
  type: Type.OBJECT,
  properties: {
    suggestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          severity: { type: Type.STRING, enum: ['Info', 'Warning', 'Error'] },
          message: { type: Type.STRING },
          nodeId: { type: Type.STRING },
        }
      }
    }
  }
};
