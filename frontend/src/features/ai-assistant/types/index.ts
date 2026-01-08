/**
 * AI Assistant Types
 */

export interface ContractAnalysis {
  id: string;
  documentId: string;
  clauses: ClauseExtraction[];
  risks: RiskDetection[];
  recommendations: Recommendation[];
  confidence: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  analysisDate: string;
  modelUsed: string;
  processingTimeMs?: number;
  summary?: string;
  keyTerms?: Record<string, string>;
  contractType?: string;
  partiesIdentified?: { name: string; role: string }[];
  effectiveDate?: string;
  expirationDate?: string;
  totalValue?: number;
  errorMessage?: string;
}

export interface ClauseExtraction {
  id: string;
  type: string;
  title: string;
  content: string;
  pageNumber?: number;
  position?: { start: number; end: number };
  importance: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface RiskDetection {
  id: string;
  category: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  clause?: ClauseExtraction;
  recommendation: string;
  confidence: number;
}

export interface Recommendation {
  id: string;
  type: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  suggestedAction: string;
  relatedClauses: string[];
}

export interface LegalBrief {
  id: string;
  matterId: string;
  title: string;
  type: 'MOTION' | 'MEMORANDUM' | 'RESPONSE' | 'REPLY' | 'APPELLATE' | 'AMICUS' | 'TRIAL' | 'OTHER';
  arguments: LegalArgument[];
  citations: Citation[];
  status: 'DRAFT' | 'REVIEW' | 'APPROVED' | 'FILED' | 'ARCHIVED';
  introduction: string;
  conclusion: string;
  statementOfFacts?: string;
  proceduralHistory?: string;
  legalStandard?: string;
  jurisdiction?: string;
  court?: string;
  wordCount?: number;
  pageCount?: number;
  generationDate: string;
  modelUsed: string;
}

export interface LegalArgument {
  id: string;
  heading: string;
  content: string;
  legalBasis: string[];
  strength: 'WEAK' | 'MODERATE' | 'STRONG';
  order: number;
}

export interface Citation {
  id: string;
  caseTitle: string;
  citation: string;
  jurisdiction: string;
  year: number;
  relevance: string;
  quotation?: string;
  page?: number;
}

export interface DepositionOutline {
  id: string;
  matterId: string;
  witnessName: string;
  witnessRole?: string;
  witnessAffiliation?: string;
  topics: DepositionTopic[];
  questions: DepositionQuestion[];
  exhibits: ExhibitReference[];
  status: 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'IN_USE' | 'COMPLETED' | 'ARCHIVED';
  objectives?: string;
  keyFacts?: { fact: string; importance: string }[];
  depositionDate?: string;
  estimatedDurationMinutes?: number;
  location?: string;
  preparationNotes?: string;
  modelUsed: string;
  generationDate: string;
}

export interface DepositionTopic {
  id: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  estimatedTimeMinutes: number;
  order: number;
  subtopics?: string[];
}

export interface DepositionQuestion {
  id: string;
  topicId: string;
  question: string;
  followUpQuestions?: string[];
  expectedAnswer?: string;
  documentReferences?: string[];
  order: number;
  notes?: string;
}

export interface ExhibitReference {
  id: string;
  exhibitNumber: string;
  description: string;
  relevantTopics: string[];
  documentId?: string;
  notes?: string;
}

export interface CasePrediction {
  id: string;
  matterId: string;
  outcomeProbabilities: OutcomeProbability[];
  primaryOutcome: 'PLAINTIFF_WIN' | 'DEFENDANT_WIN' | 'SETTLEMENT' | 'DISMISSAL' | 'MIXED' | 'UNCERTAIN';
  primaryOutcomeProbability: number;
  factors: PredictionFactor[];
  overallConfidence: number;
  settlementRange?: SettlementRange;
  estimatedDurationMonths?: number;
  estimatedCost?: number;
  similarCasesAnalyzed: number;
  jurisdictionWinRate?: number;
  judgeRulingTendency?: { favorable: number; unfavorable: number; neutral: number };
  keyPrecedents?: { caseTitle: string; citation: string; relevance: string }[];
  predictionDate: string;
  modelUsed: string;
  summary?: string;
  recommendations?: string;
}

export interface OutcomeProbability {
  outcome: string;
  probability: number;
  confidence: number;
  reasoning: string;
}

export interface PredictionFactor {
  id: string;
  category: string;
  description: string;
  impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  weight: number;
  confidence: number;
  explanation: string;
}

export interface SettlementRange {
  minimum: number;
  maximum: number;
  mostLikely: number;
  confidence: number;
}

export interface DocumentSummary {
  documentId: string;
  summary: string;
  keyPoints: string[];
  importantQuotes?: { text: string; context: string }[];
  mainTopics: string[];
  entities: { type: string; name: string; frequency: number }[];
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'MIXED';
  complexity: 'LOW' | 'MEDIUM' | 'HIGH';
  wordCount: number;
  readingTimeMinutes: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface AIAssistantContext {
  matterId?: string;
  documentId?: string;
  caseType?: string;
  jurisdiction?: string;
}
