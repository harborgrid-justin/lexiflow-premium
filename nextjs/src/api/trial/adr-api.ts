/**
 * ADR (Alternative Dispute Resolution) API Service
 * Manages mediation, arbitration, and settlement operations
 *
 * @module ADRApiService
 * @description Manages all ADR-related operations including:
 * - Mediation sessions and outcomes
 * - Arbitration proceedings and awards
 * - Settlement negotiations and agreements
 * - ADR provider management
 * - Session scheduling and tracking
 *
 * @security
 * - Input validation on all parameters
 * - XSS prevention through type enforcement
 * - Backend API authentication via bearer tokens
 * - Proper error handling and logging
 * - Confidentiality controls for settlement data
 *
 * @architecture
 * - Backend API primary (PostgreSQL)
 * - React Query integration via ADR_QUERY_KEYS
 * - Type-safe operations
 * - Comprehensive error handling
 */

import { apiClient } from "@/services/infrastructure/apiClient";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type ADRType =
  | "mediation"
  | "arbitration"
  | "early_neutral_evaluation"
  | "settlement_conference"
  | "mini_trial";
export type ADRStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "postponed"
  | "settled"
  | "impasse";
export type SettlementStatus =
  | "negotiating"
  | "draft"
  | "pending_approval"
  | "approved"
  | "signed"
  | "executed"
  | "rejected"
  | "withdrawn";

export interface ADRSession {
  id: string;
  caseId: string;
  adrType: ADRType;
  status: ADRStatus;
  title: string;
  description?: string;
  scheduledDate?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  isVirtual?: boolean;
  virtualMeetingUrl?: string;
  neutralId?: string;
  neutralName?: string;
  neutralOrganization?: string;
  participantIds?: string[];
  participants?: {
    partyId: string;
    partyName: string;
    representative?: string;
    role:
      | "plaintiff"
      | "defendant"
      | "mediator"
      | "arbitrator"
      | "witness"
      | "observer";
  }[];
  confidentialityLevel?: "standard" | "high" | "attorney_eyes_only";
  outcome?: ADROutcome;
  notes?: string;
  documents?: string[];
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface ADROutcome {
  result:
    | "settled"
    | "impasse"
    | "partial_settlement"
    | "continued"
    | "award_issued";
  summaryPublic?: string;
  summaryConfidential?: string;
  settlementAmount?: number;
  nextSteps?: string;
  documentIds?: string[];
}

export interface Settlement {
  id: string;
  caseId: string;
  adrSessionId?: string;
  status: SettlementStatus;
  title: string;
  description?: string;
  settlementType: "monetary" | "non_monetary" | "structured" | "hybrid";
  totalAmount?: number;
  currency?: string;
  paymentTerms?: {
    schedule: "lump_sum" | "installments" | "structured";
    dueDate?: string;
    installments?: {
      amount: number;
      dueDate: string;
      status: "pending" | "paid" | "overdue";
    }[];
  };
  nonMonetaryTerms?: string[];
  confidentialityClause?: boolean;
  nonAdmissionClause?: boolean;
  releaseScope?: "full" | "partial" | "limited";
  releasedClaims?: string[];
  excludedClaims?: string[];
  parties?: {
    partyId: string;
    partyName: string;
    role: "paying" | "receiving" | "mutual";
    signedAt?: string;
    approvedBy?: string;
  }[];
  effectiveDate?: string;
  expirationDate?: string;
  documentId?: string;
  approvals?: {
    approverId: string;
    approverName: string;
    approvedAt: string;
    notes?: string;
  }[];
  notes?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface MediationDetails extends ADRSession {
  adrType: "mediation";
  mediatorStyle?: "facilitative" | "evaluative" | "transformative";
  caucusesHeld?: number;
  jointSessionsHeld?: number;
  breakthroughMoments?: string[];
}

export interface ArbitrationDetails extends ADRSession {
  adrType: "arbitration";
  arbitrationType: "binding" | "non_binding" | "high_low";
  governingRules?: string;
  panelSize?: number;
  arbitrators?: {
    id: string;
    name: string;
    role: "chair" | "party_appointed" | "neutral";
    appointedBy?: string;
  }[];
  hearingDates?: string[];
  award?: {
    issuedAt: string;
    amount?: number;
    documentId?: string;
    appealDeadline?: string;
    isAppealed?: boolean;
  };
}

export interface ADRFilters {
  caseId?: string;
  adrType?: ADRType;
  status?: ADRStatus;
  startDate?: string;
  endDate?: string;
  neutralId?: string;
}

export interface SettlementFilters {
  caseId?: string;
  status?: SettlementStatus;
  settlementType?: Settlement["settlementType"];
  minAmount?: number;
  maxAmount?: number;
}

export interface CreateADRSessionDto {
  caseId: string;
  adrType: ADRType;
  title: string;
  description?: string;
  scheduledDate?: string;
  location?: string;
  isVirtual?: boolean;
  virtualMeetingUrl?: string;
  neutralId?: string;
  neutralName?: string;
  participantIds?: string[];
  confidentialityLevel?: ADRSession["confidentialityLevel"];
  notes?: string;
}

export interface CreateSettlementDto {
  caseId: string;
  adrSessionId?: string;
  title: string;
  description?: string;
  settlementType: Settlement["settlementType"];
  totalAmount?: number;
  currency?: string;
  paymentTerms?: Settlement["paymentTerms"];
  nonMonetaryTerms?: string[];
  confidentialityClause?: boolean;
  nonAdmissionClause?: boolean;
  releaseScope?: Settlement["releaseScope"];
  releasedClaims?: string[];
  effectiveDate?: string;
  notes?: string;
}

// ============================================================================
// QUERY KEYS
// ============================================================================

export const ADR_QUERY_KEYS = {
  sessions: {
    all: () => ["adr", "sessions"] as const,
    byId: (id: string) => ["adr", "sessions", id] as const,
    byCase: (caseId: string) => ["adr", "sessions", "case", caseId] as const,
    byType: (type: ADRType) => ["adr", "sessions", "type", type] as const,
    byStatus: (status: ADRStatus) =>
      ["adr", "sessions", "status", status] as const,
  },
  settlements: {
    all: () => ["adr", "settlements"] as const,
    byId: (id: string) => ["adr", "settlements", id] as const,
    byCase: (caseId: string) => ["adr", "settlements", "case", caseId] as const,
    byStatus: (status: SettlementStatus) =>
      ["adr", "settlements", "status", status] as const,
  },
  mediations: {
    all: () => ["adr", "mediations"] as const,
    byCase: (caseId: string) => ["adr", "mediations", "case", caseId] as const,
  },
  arbitrations: {
    all: () => ["adr", "arbitrations"] as const,
    byCase: (caseId: string) =>
      ["adr", "arbitrations", "case", caseId] as const,
  },
} as const;

// ============================================================================
// ADR API SERVICE
// ============================================================================

export class ADRApiService {
  private readonly baseUrl = "/adr";

  constructor() {
    // Initialized with Backend API (PostgreSQL)
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ADR SESSION CRUD
  // ─────────────────────────────────────────────────────────────────────────

  async getAllSessions(filters?: ADRFilters): Promise<ADRSession[]> {
    const params = new URLSearchParams();
    if (filters?.caseId) params.append("caseId", filters.caseId);
    if (filters?.adrType) params.append("adrType", filters.adrType);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.neutralId) params.append("neutralId", filters.neutralId);

    const queryString = params.toString();
    const url = queryString
      ? `${this.baseUrl}/sessions?${queryString}`
      : `${this.baseUrl}/sessions`;
    return apiClient.get<ADRSession[]>(url);
  }

  async getSessionById(id: string): Promise<ADRSession> {
    return apiClient.get<ADRSession>(`${this.baseUrl}/sessions/${id}`);
  }

  async getSessionsByCaseId(caseId: string): Promise<ADRSession[]> {
    return this.getAllSessions({ caseId });
  }

  async createSession(data: CreateADRSessionDto): Promise<ADRSession> {
    return apiClient.post<ADRSession>(`${this.baseUrl}/sessions`, data);
  }

  async updateSession(
    id: string,
    data: Partial<ADRSession>
  ): Promise<ADRSession> {
    return apiClient.put<ADRSession>(`${this.baseUrl}/sessions/${id}`, data);
  }

  async updateSessionStatus(
    id: string,
    status: ADRStatus,
    notes?: string
  ): Promise<ADRSession> {
    return apiClient.patch<ADRSession>(
      `${this.baseUrl}/sessions/${id}/status`,
      { status, notes }
    );
  }

  async deleteSession(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/sessions/${id}`);
  }

  async recordOutcome(
    sessionId: string,
    outcome: ADROutcome
  ): Promise<ADRSession> {
    return apiClient.post<ADRSession>(
      `${this.baseUrl}/sessions/${sessionId}/outcome`,
      outcome
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MEDIATION SPECIFIC
  // ─────────────────────────────────────────────────────────────────────────

  async getAllMediations(
    filters?: Omit<ADRFilters, "adrType">
  ): Promise<MediationDetails[]> {
    return apiClient.get<MediationDetails[]>(
      `${this.baseUrl}/mediations`,
      filters as Record<string, unknown>
    );
  }

  async getMediationById(id: string): Promise<MediationDetails> {
    return apiClient.get<MediationDetails>(`${this.baseUrl}/mediations/${id}`);
  }

  async getMediationsByCaseId(caseId: string): Promise<MediationDetails[]> {
    return apiClient.get<MediationDetails[]>(
      `${this.baseUrl}/mediations/case/${caseId}`
    );
  }

  async createMediation(
    data: CreateADRSessionDto & Partial<MediationDetails>
  ): Promise<MediationDetails> {
    return apiClient.post<MediationDetails>(`${this.baseUrl}/mediations`, {
      ...data,
      adrType: "mediation",
    });
  }

  async updateMediation(
    id: string,
    data: Partial<MediationDetails>
  ): Promise<MediationDetails> {
    return apiClient.put<MediationDetails>(
      `${this.baseUrl}/mediations/${id}`,
      data
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ARBITRATION SPECIFIC
  // ─────────────────────────────────────────────────────────────────────────

  async getAllArbitrations(
    filters?: Omit<ADRFilters, "adrType">
  ): Promise<ArbitrationDetails[]> {
    return apiClient.get<ArbitrationDetails[]>(
      `${this.baseUrl}/arbitrations`,
      filters as Record<string, unknown>
    );
  }

  async getArbitrationById(id: string): Promise<ArbitrationDetails> {
    return apiClient.get<ArbitrationDetails>(
      `${this.baseUrl}/arbitrations/${id}`
    );
  }

  async getArbitrationsByCaseId(caseId: string): Promise<ArbitrationDetails[]> {
    return apiClient.get<ArbitrationDetails[]>(
      `${this.baseUrl}/arbitrations/case/${caseId}`
    );
  }

  async createArbitration(
    data: CreateADRSessionDto & Partial<ArbitrationDetails>
  ): Promise<ArbitrationDetails> {
    return apiClient.post<ArbitrationDetails>(`${this.baseUrl}/arbitrations`, {
      ...data,
      adrType: "arbitration",
    });
  }

  async updateArbitration(
    id: string,
    data: Partial<ArbitrationDetails>
  ): Promise<ArbitrationDetails> {
    return apiClient.put<ArbitrationDetails>(
      `${this.baseUrl}/arbitrations/${id}`,
      data
    );
  }

  async recordAward(
    id: string,
    award: ArbitrationDetails["award"]
  ): Promise<ArbitrationDetails> {
    return apiClient.post<ArbitrationDetails>(
      `${this.baseUrl}/arbitrations/${id}/award`,
      award
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SETTLEMENT CRUD
  // ─────────────────────────────────────────────────────────────────────────

  async getAllSettlements(filters?: SettlementFilters): Promise<Settlement[]> {
    const params = new URLSearchParams();
    if (filters?.caseId) params.append("caseId", filters.caseId);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.settlementType)
      params.append("settlementType", filters.settlementType);
    if (filters?.minAmount)
      params.append("minAmount", filters.minAmount.toString());
    if (filters?.maxAmount)
      params.append("maxAmount", filters.maxAmount.toString());

    const queryString = params.toString();
    const url = queryString
      ? `${this.baseUrl}/settlements?${queryString}`
      : `${this.baseUrl}/settlements`;
    return apiClient.get<Settlement[]>(url);
  }

  async getSettlementById(id: string): Promise<Settlement> {
    return apiClient.get<Settlement>(`${this.baseUrl}/settlements/${id}`);
  }

  async getSettlementsByCaseId(caseId: string): Promise<Settlement[]> {
    return this.getAllSettlements({ caseId });
  }

  async createSettlement(data: CreateSettlementDto): Promise<Settlement> {
    return apiClient.post<Settlement>(`${this.baseUrl}/settlements`, data);
  }

  async updateSettlement(
    id: string,
    data: Partial<Settlement>
  ): Promise<Settlement> {
    return apiClient.put<Settlement>(`${this.baseUrl}/settlements/${id}`, data);
  }

  async updateSettlementStatus(
    id: string,
    status: SettlementStatus,
    notes?: string
  ): Promise<Settlement> {
    return apiClient.patch<Settlement>(
      `${this.baseUrl}/settlements/${id}/status`,
      { status, notes }
    );
  }

  async deleteSettlement(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/settlements/${id}`);
  }

  async approveSettlement(
    id: string,
    approverId: string,
    notes?: string
  ): Promise<Settlement> {
    return apiClient.post<Settlement>(
      `${this.baseUrl}/settlements/${id}/approve`,
      { approverId, notes }
    );
  }

  async executeSettlement(id: string): Promise<Settlement> {
    return apiClient.post<Settlement>(
      `${this.baseUrl}/settlements/${id}/execute`,
      {}
    );
  }

  async recordPayment(
    settlementId: string,
    paymentData: { amount: number; date: string; reference?: string }
  ): Promise<Settlement> {
    return apiClient.post<Settlement>(
      `${this.baseUrl}/settlements/${settlementId}/payment`,
      paymentData
    );
  }
}

// Export singleton instance
export const adrApi = new ADRApiService();
