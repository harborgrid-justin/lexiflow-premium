/**
 * OpenAI Service - Alternative AI Provider for LexiFlow
 * Provides fallback when Gemini quota is exceeded
 */

import OpenAI from 'openai';
import { ParsedDocket } from '@/types';
import { SearchResult } from '@/api/search/search-api';
import { withRetry } from '@/utils/apiUtils';
import { AnalyzedDoc, ResearchResponse, IntentResult, BriefCritique, ShepardizeResult } from '@/types/ai';

export * from '@/types/ai';

// =============================================================================
// CLIENT FACTORY
// =============================================================================

const getClient = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY || 
                 import.meta.env.OPENAI_API_KEY || 
                 (typeof localStorage !== 'undefined' ? localStorage.getItem('openai_api_key') : null);
  
  if (!apiKey) {
    throw new Error('OpenAI API key not configured. Please set VITE_OPENAI_API_KEY environment variable or openai_api_key in localStorage.');
  }
  
  return new OpenAI({ 
    apiKey,
    dangerouslyAllowBrowser: true // For client-side use - move to backend in production
  });
};

// =============================================================================
// OPENAI SERVICE
// =============================================================================

export const OpenAIService = {
  async analyzeDocument(content: string): Promise<AnalyzedDoc> {
    return withRetry(async () => {
      try {
        const client = getClient();
        const completion = await client.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a legal document analyzer. Analyze the document and provide a risk score (0-100) and summary.'
            },
            {
              role: 'user',
              content: `Analyze this legal document and return JSON with {summary: string, riskScore: number}:\n\n${content.slice(0, 10000)}`
            }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3
        });

        const result = JSON.parse(completion.choices[0].message.content || '{}');
        return { summary: result.summary || 'Analysis unavailable', riskScore: result.riskScore || 0 };
      } catch (e) {
        console.error('OpenAI Analysis Error:', e);
        return { summary: 'Analysis unavailable due to service error.', riskScore: 0 };
      }
    });
  },

  async critiqueBrief(text: string): Promise<BriefCritique> {
    return withRetry(async () => {
      try {
        const client = getClient();
        const completion = await client.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are a senior legal partner reviewing a brief. Provide constructive critique.'
            },
            {
              role: 'user',
              content: `Critique this brief and return JSON with {score: number, strengths: string[], weaknesses: string[], suggestions: string[], missingAuthority: string[]}:\n\n${text.slice(0, 15000)}`
            }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.4
        });

        const result = JSON.parse(completion.choices[0].message.content || '{}');
        return {
          score: result.score || 0,
          strengths: result.strengths || [],
          weaknesses: result.weaknesses || ['Analysis unavailable'],
          suggestions: result.suggestions || [],
          missingAuthority: result.missingAuthority || []
        };
      } catch (e) {
        console.error('OpenAI Critique Error:', e);
        return { score: 0, strengths: [], weaknesses: ['Service Error'], suggestions: [], missingAuthority: [] };
      }
    });
  },

  async reviewContract(text: string): Promise<string> {
    return withRetry(async () => {
      try {
        const client = getClient();
        const completion = await client.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a contract review attorney. Identify risks and missing clauses.'
            },
            {
              role: 'user',
              content: `Review this contract:\n\n${text.slice(0, 10000)}`
            }
          ],
          temperature: 0.3
        });

        return completion.choices[0].message.content || 'Error reviewing contract.';
      } catch (e) {
        return 'Contract review service unavailable.';
      }
    });
  },

  async *streamDraft(context: string, type: string): AsyncGenerator<string, void, unknown> {
    try {
      const client = getClient();
      const stream = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a legal drafting assistant. Generate a professional ${type}.`
          },
          {
            role: 'user',
            content: context.slice(0, 10000)
          }
        ],
        stream: true,
        temperature: 0.7
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) yield content;
      }
    } catch (e) {
      yield 'Error streaming content.';
    }
  },

  async generateDraft(prompt: string, type: string): Promise<string> {
    return withRetry(async () => {
      try {
        const client = getClient();
        const completion = await client.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are a legal drafting assistant. Generate a professional ${type}.`
            },
            {
              role: 'user',
              content: prompt.slice(0, 10000)
            }
          ],
          temperature: 0.7
        });

        return completion.choices[0].message.content || 'Error generating content.';
      } catch (e) {
        return 'Generation failed.';
      }
    });
  },

  async predictIntent(query: string): Promise<IntentResult> {
    return withRetry(async () => {
      try {
        const client = getClient();
        const completion = await client.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Predict user intent and return JSON with {action: string, confidence: number}'
            },
            {
              role: 'user',
              content: query
            }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2
        });

        const result = JSON.parse(completion.choices[0].message.content || '{}');
        return { action: result.action || 'UNKNOWN', confidence: result.confidence || 0 };
      } catch (e) {
        return { action: 'UNKNOWN', confidence: 0 };
      }
    });
  },

  async parseDocket(text: string): Promise<Partial<ParsedDocket>> {
    return withRetry(async () => {
      try {
        const client = getClient();
        const completion = await client.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Extract case data from docket and return structured JSON.'
            },
            {
              role: 'user',
              content: `Parse this docket:\n\n${text.slice(0, 10000)}`
            }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1
        });

        return JSON.parse(completion.choices[0].message.content || '{}');
      } catch (e) {
        console.error('Docket Parse Error', e);
        return {};
      }
    });
  },

  async conductResearch(query: string): Promise<ResearchResponse> {
    return withRetry(async () => {
      try {
        const client = getClient();
        const completion = await client.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are a legal research assistant. Provide thorough legal analysis.'
            },
            {
              role: 'user',
              content: query
            }
          ],
          temperature: 0.3
        });

        return {
          text: completion.choices[0].message.content || 'Research unavailable.',
          sources: []
        };
      } catch (e) {
        return {
          text: 'Research service unavailable.',
          sources: []
        };
      }
    });
  },

  async generateReply(lastMsg: string, role: string): Promise<string> {
    return withRetry(async () => {
      try {
        const client = getClient();
        const completion = await client.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `Draft a professional reply to this message from a ${role}.`
            },
            {
              role: 'user',
              content: lastMsg
            }
          ],
          temperature: 0.5
        });

        return completion.choices[0].message.content || '';
      } catch (e) {
        return 'Unable to generate reply.';
      }
    });
  },

  async refineTimeEntry(desc: string): Promise<string> {
    return withRetry(async () => {
      try {
        const client = getClient();
        const completion = await client.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Rewrite time entries to be ABA-compliant and professional.'
            },
            {
              role: 'user',
              content: desc
            }
          ],
          temperature: 0.3
        });

        return completion.choices[0].message.content || desc;
      } catch (e) {
        return desc;
      }
    });
  },

  async shepardizeCitation(citation: string): Promise<ShepardizeResult> {
    return withRetry(async () => {
      try {
        const client = getClient();
        const completion = await client.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are a legal research assistant. Analyze case citation validity and treatment history. Return JSON with {status: string, treatment: string[], citingCases: string[], redFlags: string[]}.'
            },
            {
              role: 'user',
              content: `Shepardize this citation: ${citation}`
            }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2
        });

        const result = JSON.parse(completion.choices[0].message.content || '{}');
        return {
          status: result.status || 'Unknown',
          treatment: result.treatment || [],
          citingCases: result.citingCases || [],
          redFlags: result.redFlags || []
        };
      } catch (e) {
        console.error('Shepardize Error:', e);
        return {
          status: 'Analysis unavailable',
          treatment: [],
          citingCases: [],
          redFlags: ['Service error - unable to verify citation']
        };
      }
    });
  },

  async extractCaseData(text: string): Promise<Partial<ParsedDocket>> {
    return withRetry(async () => {
      try {
        const client = getClient();
        const completion = await client.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'Extract structured case data from unstructured text. Return JSON with case details including parties, attorneys, dates, court, etc.'
            },
            {
              role: 'user',
              content: `Extract case data from this text:\n\n${text.slice(0, 15000)}`
            }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1
        });

        return JSON.parse(completion.choices[0].message.content || '{}');
      } catch (e) {
        console.error('Extract Case Data Error:', e);
        return {};
      }
    });
  }
};
