import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

export interface ParsedCaseData {
  title?: string;
  caseNumber?: string;
  description?: string;
  type?: string;
  status?: string;
  practiceArea?: string;
  jurisdiction?: string;
  court?: string;
  judge?: string;
  referredJudge?: string;
  magistrateJudge?: string;
  filingDate?: string;
  trialDate?: string;
  closeDate?: string;
  dateTerminated?: string;
  juryDemand?: string;
  causeOfAction?: string;
  natureOfSuit?: string;
  natureOfSuitCode?: string;
  relatedCases?: { court: string; caseNumber: string; relationship?: string }[];
  assignedTeamId?: string;
  leadAttorneyId?: string;
  clientId?: string;
  metadata?: Record<string, unknown>;
}

export interface ImportOptions {
  useAI: boolean;
  provider?: 'gemini' | 'openai';
  apiKey?: string;
}

/**
 * ╔=================================================================================================================╗
 * ║CASEIMPORT                                                                                                       ║
 * ╠=================================================================================================================╣
 * ║                                                                                                                 ║
 * ║  External Request                   Controller                            Service                                ║
 * ║       │                                   │                                     │                                ║
 * ║       │  HTTP Endpoints                  │                                     │                                ║
 * ║       └───────────────────────────────────►                                     │                                ║
 * ║                                                                                                                 ║
 * ║                                                                 ┌───────────────┴───────────────┐                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          Repository                    Database                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          PostgreSQL                                          ║
 * ║                                                                                                                 ║
 * ║  DATA IN:  Data input                                                                                         ║

 * ║                                                                                                                 ║
 * ║  DATA OUT: Data output                                                                                        ║

 * ║                                                                                                                 ║

 * ╚=================================================================================================================╝
 */

@Injectable()
export class CaseImportService {
  private readonly logger = new Logger(CaseImportService.name);

  constructor(private readonly configService: ConfigService) {}

  private async retryOperation<T>(operation: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const statusCode = error && typeof error === 'object' && 'status' in error ? (error as { status: number }).status : undefined;
      if (retries > 0 && statusCode === 429) {
        this.logger.warn(`Rate limited. Retrying in ${delay}ms... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.retryOperation(operation, retries - 1, delay * 2);
      }
      throw error;
    }
  }

  async parse(content: string, options: ImportOptions): Promise<ParsedCaseData> {
    let parsedData: ParsedCaseData | null = null;

    // 1. Try AI extraction if enabled
    if (options.useAI) {
      try {
        if (options.provider === 'openai') {
          parsedData = await this.parseWithOpenAI(content, options.apiKey);
        } else {
          parsedData = await this.parseWithGemini(content, options.apiKey);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : undefined;
        this.logger.error(`AI extraction failed: ${errorMessage}`, errorStack);
        // Fallback to rule-based
      }
    }

    // 2. Fallback to rule-based extraction
    if (!parsedData || Object.keys(parsedData).length === 0) {
      this.logger.log('Falling back to rule-based extraction');
      if (content.trim().startsWith('<?xml') || content.trim().startsWith('<')) {
        parsedData = this.parseXML(content);
      } else {
        parsedData = this.parseText(content);
      }
    }

    return parsedData || {};
  }

  private async parseWithGemini(content: string, clientApiKey?: string): Promise<ParsedCaseData> {
    const apiKey = clientApiKey || this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `
      Extract case data from the following text/document and return a JSON object.
      
      REQUIRED: Return these exact field names:
      - title (the case name/title, e.g., "Gibson v. Mississippi")
      - caseNumber (case/docket number or citation if no docket exists, e.g., "162 U.S. 565")
      - description (brief case summary)
      - type (Civil, Criminal, Administrative, etc.)
      - status (Active, Pending, Closed, etc.)
      - practiceArea (Civil Rights, Employment, Contracts, etc.)
      - jurisdiction (Federal, State, etc.)
      - court (full court name)
      - judge (presiding judge name)
      - filingDate (YYYY-MM-DD format)
      - trialDate (YYYY-MM-DD format)
      - causeOfAction (legal basis for the suit)
      - natureOfSuit (description of the legal matter)
      
      IMPORTANT: Use 'title' for case name, NOT 'caseName'. Use 'caseNumber' for docket/citation.
      
      Document content:
      ${content.slice(0, 20000)}
    `;

    const result = await this.retryOperation(() => model.generateContent(prompt));
    const response = result.response;
    const text = response.text();
    
    try {
      const parsed = JSON.parse(text) as Record<string, unknown>;
      // Normalize field names in case AI returns variations
      const normalized: ParsedCaseData = {
        title: (parsed.title || parsed.caseName || parsed.case_name) as string | undefined,
        caseNumber: (parsed.caseNumber || parsed.case_number || parsed.citation || parsed.docketNumber) as string | undefined,
        description: (parsed.description || parsed.summary) as string | undefined,
        type: (parsed.type || parsed.caseType) as string | undefined,
        status: parsed.status as string | undefined,
        practiceArea: (parsed.practiceArea || parsed.practice_area) as string | undefined,
        jurisdiction: parsed.jurisdiction as string | undefined,
        court: (parsed.court || parsed.courtName) as string | undefined,
        judge: (parsed.judge || parsed.presidingJudge) as string | undefined,
        referredJudge: (parsed.referredJudge || parsed.referred_judge) as string | undefined,
        magistrateJudge: (parsed.magistrateJudge || parsed.magistrate_judge) as string | undefined,
        filingDate: (parsed.filingDate || parsed.filing_date || parsed.dateFiled) as string | undefined,
        trialDate: (parsed.trialDate || parsed.trial_date) as string | undefined,
        closeDate: (parsed.closeDate || parsed.close_date) as string | undefined,
        dateTerminated: (parsed.dateTerminated || parsed.date_terminated) as string | undefined,
        juryDemand: (parsed.juryDemand || parsed.jury_demand) as string | undefined,
        causeOfAction: (parsed.causeOfAction || parsed.cause_of_action) as string | undefined,
        natureOfSuit: (parsed.natureOfSuit || parsed.nature_of_suit) as string | undefined,
        natureOfSuitCode: (parsed.natureOfSuitCode || parsed.nature_of_suit_code) as string | undefined,
        relatedCases: (parsed.relatedCases || parsed.related_cases) as ParsedCaseData['relatedCases'],
        assignedTeamId: (parsed.assignedTeamId || parsed.assigned_team_id) as string | undefined,
        leadAttorneyId: (parsed.leadAttorneyId || parsed.lead_attorney_id) as string | undefined,
        clientId: (parsed.clientId || parsed.client_id) as string | undefined,
        metadata: (parsed.metadata || parsed) as Record<string, unknown> | undefined
      };
      // Remove undefined values
      Object.keys(normalized).forEach(key => {
        if (normalized[key as keyof ParsedCaseData] === undefined) {
          delete normalized[key as keyof ParsedCaseData];
        }
      });
      return normalized;
    } catch (e) {
      this.logger.error('Failed to parse Gemini JSON response', e);
      return {};
    }
  }

  private async parseWithOpenAI(content: string, clientApiKey?: string): Promise<ParsedCaseData> {
    const apiKey = clientApiKey || this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const openai = new OpenAI({ apiKey });
    const completion = await this.retryOperation(() => openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a legal assistant. Extract case data from the provided text and return it as JSON with these exact fields: title (case name), caseNumber (docket/citation), description, type, status, practiceArea, jurisdiction, court, judge, filingDate (YYYY-MM-DD), trialDate, causeOfAction, natureOfSuit. Use "title" NOT "caseName", and "caseNumber" NOT "citation".'
        },
        {
          role: 'user',
          content: content.slice(0, 20000)
        }
      ],
      response_format: { type: 'json_object' },
    }));

    try {
      const content = completion.choices[0]?.message?.content || '{}';
      return JSON.parse(content) as ParsedCaseData;
    } catch (e) {
      this.logger.error('Failed to parse OpenAI JSON response', e);
      return {};
    }
  }

  private parseXML(xmlText: string): ParsedCaseData {
    // Basic XML parsing using regex since we don't have a DOM parser in Node.js environment easily without extra deps
    // For production, a proper XML parser like 'fast-xml-parser' is recommended.
    // Here we implement a robust regex-based extractor for standard tags.
    
    const data: ParsedCaseData = {};
    
    const extractTag = (tag: string, text: string): string | undefined => {
      const regex = new RegExp(`<${tag}[^>]*>(.*?)</${tag}>`, 'is');
      const match = text.match(regex);
      return match && match[1] ? match[1].trim() : undefined;
    };

    // Map common XML tags
    data.title = extractTag('title', xmlText) || extractTag('caseName', xmlText) || extractTag('case_name', xmlText);
    data.caseNumber = extractTag('caseNumber', xmlText) || extractTag('case_number', xmlText) || extractTag('docket_number', xmlText);
    data.description = extractTag('description', xmlText) || extractTag('summary', xmlText);
    data.court = extractTag('court', xmlText) || extractTag('courtName', xmlText);
    data.judge = extractTag('judge', xmlText) || extractTag('assigned_judge', xmlText);
    data.filingDate = extractTag('filingDate', xmlText) || extractTag('date_filed', xmlText);
    
    return data;
  }

  private parseText(text: string): ParsedCaseData {
    const data: ParsedCaseData = {};
    const lines = text.split('\n');

    const patterns = {
      title: /^(?:title|case\s*name|matter):\s*(.+)$/i,
      caseNumber: /^(?:case\s*(?:number|#)|docket\s*(?:number|#)):\s*(.+)$/i,
      description: /^(?:description|summary):\s*(.+)$/i,
      type: /^(?:type|case\s*type):\s*(.+)$/i,
      status: /^(?:status|case\s*status):\s*(.+)$/i,
      practiceArea: /^(?:practice\s*area|area):\s*(.+)$/i,
      jurisdiction: /^(?:jurisdiction|venue):\s*(.+)$/i,
      court: /^(?:court|court\s*name):\s*(.+)$/i,
      judge: /^(?:judge|assigned\s*judge|presiding\s*judge):\s*(.+)$/i,
      filingDate: /^(?:filing\s*date|date\s*filed|filed):\s*(.+)$/i,
      trialDate: /^(?:trial\s*date):\s*(.+)$/i,
    };

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      for (const [key, pattern] of Object.entries(patterns)) {
        const match = trimmedLine.match(pattern);
        if (match && match[1]) {
          (data as Record<string, string>)[key] = match[1].trim();
          break;
        }
      }
    }

    // Fallback patterns
    if (!data.caseNumber) {
      // Try standard federal format: 1:23-cv-00123
      const caseNumMatch = text.match(/(?:case\s*no\.?|docket\s*no\.?)[\s:]*([0-9]:[0-9]{2}-[a-z]{2}-[0-9]+)/i);
      if (caseNumMatch && caseNumMatch[1]) data.caseNumber = caseNumMatch[1];
      
      // Try simple number format if labeled
      if (!data.caseNumber) {
        const simpleMatch = text.match(/(?:No\.|Number)\s+(\d+)/i);
        if (simpleMatch && simpleMatch[1]) data.caseNumber = simpleMatch[1];
      }
    }

    if (!data.title) {
      // Try standard "X v. Y" format
      const vsMatch = text.match(/([A-Z][a-zA-Z\s,]+)\s+v\.?\s+([A-Z][a-zA-Z\s,]+)/);
      if (vsMatch && vsMatch[1] && vsMatch[2]) {
        data.title = `${vsMatch[1].trim()} v. ${vsMatch[2].trim()}`;
      }
      
      // Try extracting from first line if it looks like a title (short, no periods at end)
      if (!data.title && lines.length > 0 && lines[0]) {
        const firstLine = lines[0].trim();
        if (firstLine.length > 5 && firstLine.length < 100 && !firstLine.endsWith('.')) {
          data.title = firstLine;
        }
      }
    }
    
    // Try to extract court from text if not found
    if (!data.court) {
      if (text.includes('Supreme Court')) data.court = 'Supreme Court of the United States';
      else if (text.includes('Court of Appeals')) data.court = 'Court of Appeals';
      else if (text.includes('District Court')) data.court = 'District Court';
    }

    return data;
  }
}
