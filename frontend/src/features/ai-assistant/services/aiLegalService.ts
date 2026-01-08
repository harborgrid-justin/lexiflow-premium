/**
 * AI Legal Service
 * API client for AI legal assistant features
 */

import axios from 'axios';
import type {
  ContractAnalysis,
  LegalBrief,
  DepositionOutline,
  CasePrediction,
  DocumentSummary,
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export class AILegalService {
  private static instance: AILegalService;
  private apiClient = axios.create({
    baseURL: `${API_BASE_URL}/ai-legal`,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  private constructor() {
    // Add auth token interceptor
    this.apiClient.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  static getInstance(): AILegalService {
    if (!AILegalService.instance) {
      AILegalService.instance = new AILegalService();
    }
    return AILegalService.instance;
  }

  // ==================== Contract Analysis ====================

  async analyzeContract(documentId: string): Promise<ContractAnalysis> {
    const response = await this.apiClient.post('/contracts/analyze', { documentId });
    return response.data;
  }

  async getContractAnalyses(page = 1, limit = 20) {
    const response = await this.apiClient.get('/contracts/analyses', {
      params: { page, limit },
    });
    return response.data;
  }

  async getContractAnalysisById(id: string): Promise<ContractAnalysis> {
    const response = await this.apiClient.get(`/contracts/analyses/${id}`);
    return response.data;
  }

  async getHighRiskContracts(): Promise<ContractAnalysis[]> {
    const response = await this.apiClient.get('/contracts/high-risk');
    return response.data;
  }

  async getContractStatistics() {
    const response = await this.apiClient.get('/contracts/statistics');
    return response.data;
  }

  async deleteContractAnalysis(id: string): Promise<void> {
    await this.apiClient.delete(`/contracts/analyses/${id}`);
  }

  // ==================== Legal Briefs ====================

  async generateBrief(data: {
    matterId: string;
    briefType: string;
    title: string;
    facts: string;
    legalIssues: string[];
    jurisdiction: string;
    court?: string;
    precedents?: string[];
  }): Promise<LegalBrief> {
    const response = await this.apiClient.post('/briefs/generate', data);
    return response.data;
  }

  async getBriefsByMatter(matterId: string): Promise<LegalBrief[]> {
    const response = await this.apiClient.get('/briefs', { params: { matterId } });
    return response.data;
  }

  async getBriefById(id: string): Promise<LegalBrief> {
    const response = await this.apiClient.get(`/briefs/${id}`);
    return response.data;
  }

  async updateBriefStatus(id: string, status: string): Promise<LegalBrief> {
    const response = await this.apiClient.patch(`/briefs/${id}/status`, { status });
    return response.data;
  }

  async updateBrief(id: string, updates: Partial<LegalBrief>): Promise<LegalBrief> {
    const response = await this.apiClient.patch(`/briefs/${id}`, updates);
    return response.data;
  }

  async deleteBrief(id: string): Promise<void> {
    await this.apiClient.delete(`/briefs/${id}`);
  }

  async getBriefStatistics() {
    const response = await this.apiClient.get('/briefs-statistics');
    return response.data;
  }

  // ==================== Deposition Preparation ====================

  async generateDepositionOutline(data: {
    matterId: string;
    witnessName: string;
    witnessRole?: string;
    witnessAffiliation?: string;
    caseBackground: string;
    keyFacts: string[];
    objectives: string[];
    availableExhibits?: { exhibitNumber: string; description: string }[];
  }): Promise<DepositionOutline> {
    const response = await this.apiClient.post('/depositions/generate-outline', data);
    return response.data;
  }

  async getDepositionOutlinesByMatter(matterId: string): Promise<DepositionOutline[]> {
    const response = await this.apiClient.get('/depositions/outlines', { params: { matterId } });
    return response.data;
  }

  async getDepositionOutlineById(id: string): Promise<DepositionOutline> {
    const response = await this.apiClient.get(`/depositions/outlines/${id}`);
    return response.data;
  }

  async updateDepositionOutlineStatus(id: string, status: string): Promise<DepositionOutline> {
    const response = await this.apiClient.patch(`/depositions/outlines/${id}/status`, { status });
    return response.data;
  }

  async updateDepositionOutline(
    id: string,
    updates: Partial<DepositionOutline>
  ): Promise<DepositionOutline> {
    const response = await this.apiClient.patch(`/depositions/outlines/${id}`, updates);
    return response.data;
  }

  async deleteDepositionOutline(id: string): Promise<void> {
    await this.apiClient.delete(`/depositions/outlines/${id}`);
  }

  async getDepositionStatistics() {
    const response = await this.apiClient.get('/depositions/statistics');
    return response.data;
  }

  // ==================== Predictive Analytics ====================

  async predictOutcome(data: {
    matterId: string;
    caseType: string;
    jurisdiction: string;
    facts: string;
    legalIssues: string[];
    evidenceStrength: 'WEAK' | 'MODERATE' | 'STRONG';
    opposingPartyStrength: 'WEAK' | 'MODERATE' | 'STRONG';
    estimatedValue?: number;
    judge?: string;
    precedents?: string[];
  }): Promise<CasePrediction> {
    const response = await this.apiClient.post('/predictions/predict-outcome', data);
    return response.data;
  }

  async getPredictionsByMatter(matterId: string): Promise<CasePrediction[]> {
    const response = await this.apiClient.get('/predictions', { params: { matterId } });
    return response.data;
  }

  async getPredictionById(id: string): Promise<CasePrediction> {
    const response = await this.apiClient.get(`/predictions/${id}`);
    return response.data;
  }

  async comparePredictions(matterId: string) {
    const response = await this.apiClient.get(`/predictions/compare/${matterId}`);
    return response.data;
  }

  async deletePrediction(id: string): Promise<void> {
    await this.apiClient.delete(`/predictions/${id}`);
  }

  async getPredictionStatistics() {
    const response = await this.apiClient.get('/predictions-statistics');
    return response.data;
  }

  // ==================== Document Summarization ====================

  async summarizeDocument(data: {
    documentId: string;
    summaryLength?: 'SHORT' | 'MEDIUM' | 'LONG';
    focusAreas?: string[];
    includeKeyPoints?: boolean;
    includeQuotes?: boolean;
  }): Promise<DocumentSummary> {
    const response = await this.apiClient.post('/summarization/summarize', data);
    return response.data;
  }

  async generateExecutiveSummary(documentIds: string[], caseTitle: string) {
    const response = await this.apiClient.post('/summarization/executive-summary', {
      documentIds,
      caseTitle,
    });
    return response.data;
  }

  async extractKeyClauses(documentId: string) {
    const response = await this.apiClient.post(`/summarization/extract-clauses/${documentId}`);
    return response.data;
  }

  async compareDocuments(documentId1: string, documentId2: string) {
    const response = await this.apiClient.post('/summarization/compare', {
      documentId1,
      documentId2,
    });
    return response.data;
  }

  // ==================== Due Diligence ====================

  async conductDueDiligence(data: {
    entityName: string;
    entityType: 'COMPANY' | 'INDIVIDUAL' | 'PROPERTY' | 'INVESTMENT';
    jurisdiction: string;
    transactionType: string;
    documentsProvided: string[];
    specificConcerns?: string[];
  }) {
    const response = await this.apiClient.post('/due-diligence/analyze', data);
    return response.data;
  }

  async quickRiskAssessment(entityName: string, entityType: string, keyInfo: string) {
    const response = await this.apiClient.post('/due-diligence/quick-assessment', {
      entityName,
      entityType,
      keyInfo,
    });
    return response.data;
  }
}

export const aiLegalService = AILegalService.getInstance();
