// types/legal-research.ts
// Domain-specific types - split from compatibility.ts

import {
  BaseEntity, UserId, DocumentId, EvidenceId
  } from './primitives';
import {
  
  
  
  
  
  
  LegalRuleType
  } from './enums';
import { SearchResult } from '@/services/api/search/search-api';

export interface Citation extends BaseEntity {
  // Backend: citations table
  citation: string; // Backend: varchar (required) - the actual citation text
  court: string; // Backend: varchar (required)
  year: number; // Backend: int (required)
  title?: string; // Backend: varchar
  caseId?: string; // Backend: uuid, FK to cases
  documentId?: string; // Backend: uuid
  status: string; // Backend: varchar (default: 'Valid')
  shepards?: any; // Backend: json
  signal?: string; // Signal indicator (e.g., 'positive', 'negative', 'warning')
  
  // Frontend-specific (legacy)
  type?: string; // Deprecated
  description?: string; // Deprecated
  relevance?: string; // Deprecated - use shepards instead
  shepardsSignal?: string; // Deprecated - use status or shepards.signal
  embedding?: number[]; // Vector embeddings for AI
}

export interface LegalArgument extends BaseEntity { title: string; description: string; strength: number; status: string; relatedCitationIds: string[]; relatedEvidenceIds: EvidenceId[]; }

export interface Defense extends BaseEntity { title: string; type: string; status: string; description?: string; }

export interface ResearchSession extends BaseEntity { userId: UserId; query: string; response: string; sources: SearchResult[]; timestamp: string; }

export interface BriefAnalysisSession extends BaseEntity { textSnapshot: string; extractedCitations: string[]; riskScore: number; strengths: string[]; weaknesses: string[]; suggestions: string[]; missingAuthority: string[]; timestamp: string; }

export interface LegalRule extends BaseEntity { 
  code: string; 
  name: string; 
  type: LegalRuleType; 
  description?: string;
  jurisdiction?: string;
  effectiveDate?: string;
  source?: string;
  url?: string;
  level?: string; 
  summary?: string; 
  text?: string; 
  parentId?: string; 
  children?: LegalRule[]; 
  structuredContent?: any; 
}

export interface Playbook extends BaseEntity { name: string; jurisdiction: string; matterType: string; stages: any[]; }

export interface WikiArticle extends BaseEntity { title: string; category: string; content: string; lastUpdated: string; isFavorite: boolean; author: string; }

export interface Precedent extends BaseEntity { title: string; type: string; description: string; tag: string; docId: DocumentId; embedding?: number[]; }

// Backend: knowledge_articles table
export interface KnowledgeArticle extends BaseEntity {
  title: string; // Backend: varchar (required)
  content: string; // Backend: text (required)
  category?: string; // Backend: varchar
  tags?: string[]; // Backend: simple-array
  status: string; // Backend: varchar (default: 'draft')
  authorId?: string; // Backend: uuid
  viewCount: number; // Backend: int (default: 0)
}

export interface QAItem extends BaseEntity { question: string; asker: string; time: string; answer: string; answerer: string; role: string; verified: boolean; }
