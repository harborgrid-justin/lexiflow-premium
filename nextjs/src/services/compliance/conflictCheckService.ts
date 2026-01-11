/**
 * @module services/compliance/conflictCheckService
 * @category Compliance Services
 * @description Production conflict checking service for legal ethics compliance.
 * Identifies conflicts of interest between clients, opposing parties, attorneys,
 * and cases. Supports automated checks, manual overrides, and waiver management.
 *
 * @example
 * ```typescript
 * // Run conflict check
 * const result = await ConflictCheckService.checkConflicts({
 *   type: 'new_client',
 *   clientName: 'Acme Corp',
 *   opposingParties: ['Beta LLC'],
 *   practiceArea: 'Corporate'
 * });
 *
 * // Get existing conflicts
 * const conflicts = await ConflictCheckService.getConflicts('case-123');
 * ```
 */

import { complianceApi } from "@/api/domains/compliance.api";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type ConflictType =
  | "direct_client"
  | "opposing_party"
  | "related_entity"
  | "attorney_conflict"
  | "business_interest"
  | "family_relationship"
  | "prior_representation"
  | "referral_source"
  | "vendor_relationship";

export type ConflictSeverity =
  | "critical"
  | "high"
  | "medium"
  | "low"
  | "informational";

export interface ConflictCheckRequest {
  type: "new_client" | "new_case" | "new_party" | "attorney_assignment";
  clientId?: string;
  clientName?: string;
  caseId?: string;
  opposingParties?: string[];
  relatedEntities?: string[];
  practiceArea?: string;
  assignedAttorneys?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
}

export interface ConflictMatch {
  id: string;
  type: ConflictType;
  severity: ConflictSeverity;
  description: string;
  matchedEntity: {
    type: "client" | "case" | "party" | "attorney" | "entity";
    id: string;
    name: string;
  };
  conflictingEntity: {
    type: "client" | "case" | "party" | "attorney" | "entity";
    id: string;
    name: string;
  };
  relationshipType: string;
  confidence: number;
  details: string;
  detectedAt: Date;
}

export interface ConflictCheckResult {
  requestId: string;
  timestamp: Date;
  hasConflicts: boolean;
  matches: ConflictMatch[];
  summary: {
    total: number;
    bySeverity: Record<ConflictSeverity, number>;
    byType: Record<ConflictType, number>;
  };
  recommendations: string[];
  requiresWaiver: boolean;
}

export interface ConflictWaiver {
  id: string;
  conflictId: string;
  requestedBy: string;
  requestedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  status: "pending" | "approved" | "rejected";
  reason: string;
  clientConsent?: boolean;
  documentId?: string;
}

export interface ConflictRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  severity: ConflictSeverity;
  conditions: {
    entityTypes: string[];
    relationshipTypes: string[];
    practiceAreas?: string[];
  };
  actions: {
    blockOnMatch: boolean;
    requireWaiver: boolean;
    notifyUsers: string[];
  };
}

// ============================================================================
// SERVICE CLASS
// ============================================================================

class ConflictCheckServiceClass {
  private readonly STORAGE_KEY = "lexiflow_conflicts";
  private conflicts: ConflictMatch[] = [];
  private waivers: ConflictWaiver[] = [];
  private rules: ConflictRule[] = this.getDefaultRules();

  constructor() {
    this.loadConflicts();
  }

  /**
   * Runs comprehensive conflict check
   */
  async checkConflicts(
    request: ConflictCheckRequest
  ): Promise<ConflictCheckResult> {
    const requestId = this.generateRequestId();
    const matches: ConflictMatch[] = [];

    try {
      // Check different conflict types based on request type
      switch (request.type) {
        case "new_client":
          matches.push(...(await this.checkNewClient(request)));
          break;
        case "new_case":
          matches.push(...(await this.checkNewCase(request)));
          break;
        case "new_party":
          matches.push(...(await this.checkNewParty(request)));
          break;
        case "attorney_assignment":
          matches.push(...(await this.checkAttorneyAssignment(request)));
          break;
      }

      // Apply custom rules
      const ruleMatches = await this.applyRules(request, matches);
      matches.push(...ruleMatches);

      // Remove duplicates
      const uniqueMatches = this.deduplicateMatches(matches);

      // Generate summary
      const summary = this.generateSummary(uniqueMatches);

      // Generate recommendations
      const recommendations = this.generateRecommendations(uniqueMatches);

      // Determine if waiver required
      const requiresWaiver = uniqueMatches.some(
        (m) => m.severity === "critical" || m.severity === "high"
      );

      return {
        requestId,
        timestamp: new Date(),
        hasConflicts: uniqueMatches.length > 0,
        matches: uniqueMatches,
        summary,
        recommendations,
        requiresWaiver,
      };
    } catch (error) {
      console.error("Conflict check failed:", error);
      throw error;
    }
  }

  /**
   * Gets existing conflicts for a resource
   */
  async getConflicts(resourceId: string): Promise<ConflictMatch[]> {
    return this.conflicts.filter(
      (c) =>
        c.matchedEntity.id === resourceId ||
        c.conflictingEntity.id === resourceId
    );
  }

  /**
   * Stores a conflict match
   */
  async storeConflict(match: ConflictMatch): Promise<void> {
    this.conflicts.push(match);
    await this.saveConflicts();
  }

  /**
   * Requests a conflict waiver
   */
  async requestWaiver(params: {
    conflictId: string;
    requestedBy: string;
    reason: string;
    clientConsent?: boolean;
    documentId?: string;
  }): Promise<ConflictWaiver> {
    const waiver: ConflictWaiver = {
      id: this.generateWaiverId(),
      conflictId: params.conflictId,
      requestedBy: params.requestedBy,
      requestedAt: new Date(),
      status: "pending",
      reason: params.reason,
      clientConsent: params.clientConsent,
      documentId: params.documentId,
    };

    this.waivers.push(waiver);
    await this.saveConflicts();

    return waiver;
  }

  /**
   * Approves or rejects a waiver
   */
  async processWaiver(
    waiverId: string,
    status: "approved" | "rejected",
    approvedBy: string
  ): Promise<ConflictWaiver> {
    const waiver = this.waivers.find((w) => w.id === waiverId);

    if (!waiver) {
      throw new Error("Waiver not found");
    }

    waiver.status = status;
    waiver.approvedBy = approvedBy;
    waiver.approvedAt = new Date();

    await this.saveConflicts();

    return waiver;
  }

  /**
   * Gets all pending waivers
   */
  async getPendingWaivers(): Promise<ConflictWaiver[]> {
    return this.waivers.filter((w) => w.status === "pending");
  }

  /**
   * Adds or updates a conflict rule
   */
  async updateRule(rule: ConflictRule): Promise<void> {
    const index = this.rules.findIndex((r) => r.id === rule.id);

    if (index >= 0) {
      this.rules[index] = rule;
    } else {
      this.rules.push(rule);
    }

    await this.saveConflicts();
  }

  /**
   * Gets all conflict rules
   */
  async getRules(): Promise<ConflictRule[]> {
    return [...this.rules];
  }

  /**
   * Clears all stored conflicts (use with caution)
   */
  async clearConflicts(): Promise<void> {
    this.conflicts = [];
    await this.saveConflicts();
  }

  // ============================================================================
  // PRIVATE CONFLICT CHECK METHODS
  // ============================================================================

  /**
   * Checks conflicts for new client
   */
  private async checkNewClient(
    request: ConflictCheckRequest
  ): Promise<ConflictMatch[]> {
    const matches: ConflictMatch[] = [];
    const { clientName, opposingParties = [] } = request;

    if (!clientName) return matches;

    // Check against existing clients
    const existingClients = await this.fetchClients();
    for (const client of existingClients) {
      if (this.namesMatch(clientName, client.name)) {
        matches.push({
          id: this.generateConflictId(),
          type: "direct_client",
          severity: "high",
          description: "Potential duplicate client",
          matchedEntity: { type: "client", id: "new", name: clientName },
          conflictingEntity: {
            type: "client",
            id: client.id,
            name: client.name,
          },
          relationshipType: "duplicate_client",
          confidence: this.calculateNameSimilarity(clientName, client.name),
          details: `Client name matches existing client record`,
          detectedAt: new Date(),
        });
      }
    }

    // Check if client appears as opposing party in other cases
    const cases = await this.fetchCases();
    for (const caseItem of cases) {
      if (caseItem.opposingParties?.includes(clientName)) {
        matches.push({
          id: this.generateConflictId(),
          type: "opposing_party",
          severity: "critical",
          description: "Client is opposing party in existing case",
          matchedEntity: { type: "client", id: "new", name: clientName },
          conflictingEntity: {
            type: "case",
            id: caseItem.id,
            name: caseItem.title,
          },
          relationshipType: "opposing_party",
          confidence: 1.0,
          details: `${clientName} is listed as opposing party in case ${caseItem.caseNumber}`,
          detectedAt: new Date(),
        });
      }
    }

    // Check opposing parties against existing clients
    for (const opposingParty of opposingParties) {
      for (const client of existingClients) {
        if (this.namesMatch(opposingParty, client.name)) {
          matches.push({
            id: this.generateConflictId(),
            type: "opposing_party",
            severity: "critical",
            description: "Opposing party is existing client",
            matchedEntity: { type: "party", id: "new", name: opposingParty },
            conflictingEntity: {
              type: "client",
              id: client.id,
              name: client.name,
            },
            relationshipType: "client_v_client",
            confidence: this.calculateNameSimilarity(
              opposingParty,
              client.name
            ),
            details: `Opposing party ${opposingParty} matches existing client`,
            detectedAt: new Date(),
          });
        }
      }
    }

    return matches;
  }

  /**
   * Checks conflicts for new case
   */
  private async checkNewCase(
    request: ConflictCheckRequest
  ): Promise<ConflictMatch[]> {
    const matches: ConflictMatch[] = [];
    const { clientId, opposingParties = [] } = request;

    if (!clientId) return matches;

    const client = await this.fetchClient(clientId);
    if (!client) return matches;

    // Check opposing parties
    const existingClients = await this.fetchClients();
    for (const opposingParty of opposingParties) {
      for (const existingClient of existingClients) {
        if (this.namesMatch(opposingParty, existingClient.name)) {
          matches.push({
            id: this.generateConflictId(),
            type: "opposing_party",
            severity: "critical",
            description: "Opposing party is existing client",
            matchedEntity: { type: "client", id: clientId, name: client.name },
            conflictingEntity: {
              type: "client",
              id: existingClient.id,
              name: existingClient.name,
            },
            relationshipType: "client_v_client",
            confidence: this.calculateNameSimilarity(
              opposingParty,
              existingClient.name
            ),
            details: `Cannot represent ${client.name} against existing client ${existingClient.name}`,
            detectedAt: new Date(),
          });
        }
      }
    }

    return matches;
  }

  /**
   * Checks conflicts for new party
   */
  private async checkNewParty(
    request: ConflictCheckRequest
  ): Promise<ConflictMatch[]> {
    const matches: ConflictMatch[] = [];
    const { opposingParties = [] } = request;

    const existingClients = await this.fetchClients();

    for (const party of opposingParties) {
      for (const client of existingClients) {
        if (this.namesMatch(party, client.name)) {
          matches.push({
            id: this.generateConflictId(),
            type: "opposing_party",
            severity: "high",
            description: "Party is existing client",
            matchedEntity: { type: "party", id: "new", name: party },
            conflictingEntity: {
              type: "client",
              id: client.id,
              name: client.name,
            },
            relationshipType: "party_is_client",
            confidence: this.calculateNameSimilarity(party, client.name),
            details: `Party ${party} matches existing client`,
            detectedAt: new Date(),
          });
        }
      }
    }

    return matches;
  }

  /**
   * Checks conflicts for attorney assignment
   */
  private async checkAttorneyAssignment(
    request: ConflictCheckRequest
  ): Promise<ConflictMatch[]> {
    const matches: ConflictMatch[] = [];
    const { assignedAttorneys = [], caseId } = request;

    if (!caseId || assignedAttorneys.length === 0) return matches;

    const caseItem = await this.fetchCase(caseId);
    if (!caseItem) return matches;

    // Check attorney conflicts (e.g., personal relationships, prior representation)
    for (const attorneyId of assignedAttorneys) {
      const conflicts = await this.fetchAttorneyConflicts(attorneyId);

      for (const conflict of conflicts) {
        if (this.isRelevantToCase(conflict, caseItem)) {
          matches.push({
            id: this.generateConflictId(),
            type: "attorney_conflict",
            severity: "high",
            description: "Attorney has conflict with case parties",
            matchedEntity: {
              type: "attorney",
              id: attorneyId,
              name: conflict.attorneyName,
            },
            conflictingEntity: {
              type: "case",
              id: caseId,
              name: caseItem.title,
            },
            relationshipType: conflict.type,
            confidence: 0.9,
            details: conflict.description,
            detectedAt: new Date(),
          });
        }
      }
    }

    return matches;
  }

  /**
   * Applies custom conflict rules
   */
  private async applyRules(
    request: ConflictCheckRequest,
    existingMatches: ConflictMatch[]
  ): Promise<ConflictMatch[]> {
    const ruleMatches: ConflictMatch[] = [];

    for (const rule of this.rules) {
      if (!rule.enabled) continue;

      // Check if rule conditions are met
      const meetsConditions = this.evaluateRuleConditions(
        rule,
        request,
        existingMatches
      );

      if (meetsConditions) {
        // Create informational match
        ruleMatches.push({
          id: this.generateConflictId(),
          type: "business_interest",
          severity: rule.severity,
          description: `Rule triggered: ${rule.name}`,
          matchedEntity: { type: "entity", id: "rule", name: rule.name },
          conflictingEntity: {
            type: "entity",
            id: "request",
            name: request.type,
          },
          relationshipType: "rule_match",
          confidence: 1.0,
          details: rule.description,
          detectedAt: new Date(),
        });
      }
    }

    return ruleMatches;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Checks if two names match (with fuzzy matching)
   */
  private namesMatch(name1: string, name2: string): boolean {
    const n1 = this.normalizeName(name1);
    const n2 = this.normalizeName(name2);

    if (n1 === n2) return true;

    // Check for substring matches
    if (n1.includes(n2) || n2.includes(n1)) return true;

    // Check similarity score
    const similarity = this.calculateNameSimilarity(n1, n2);
    return similarity > 0.85;
  }

  /**
   * Normalizes name for comparison
   */
  private normalizeName(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, " ");
  }

  /**
   * Calculates name similarity using Levenshtein distance
   */
  private calculateNameSimilarity(name1: string, name2: string): number {
    const n1 = this.normalizeName(name1);
    const n2 = this.normalizeName(name2);

    if (n1 === n2) return 1.0;

    const longer = n1.length > n2.length ? n1 : n2;

    if (longer.length === 0) return 1.0;

    const distance = this.levenshteinDistance(n1, n2);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Calculates Levenshtein distance
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i]![j] = matrix[i - 1]![j - 1]!;
        } else {
          matrix[i]![j] = Math.min(
            (matrix[i - 1]?.[j - 1] ?? 0) + 1,
            (matrix[i]?.[j - 1] ?? 0) + 1,
            (matrix[i - 1]?.[j] ?? 0) + 1
          );
        }
      }
    }

    return matrix[str2.length]?.[str1.length] ?? 0;
  }

  /**
   * Deduplicates conflict matches
   */
  private deduplicateMatches(matches: ConflictMatch[]): ConflictMatch[] {
    const seen = new Map<string, ConflictMatch>();

    for (const match of matches) {
      const key = `${match.type}-${match.matchedEntity.id}-${match.conflictingEntity.id}`;

      const existing = seen.get(key);
      if (!existing || match.severity > existing.severity) {
        seen.set(key, match);
      }
    }

    return Array.from(seen.values());
  }

  /**
   * Generates conflict summary
   */
  private generateSummary(matches: ConflictMatch[]) {
    const bySeverity: Record<ConflictSeverity, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      informational: 0,
    };

    const byType: Record<ConflictType, number> = {
      direct_client: 0,
      opposing_party: 0,
      related_entity: 0,
      attorney_conflict: 0,
      business_interest: 0,
      family_relationship: 0,
      prior_representation: 0,
      referral_source: 0,
      vendor_relationship: 0,
    };

    for (const match of matches) {
      bySeverity[match.severity]++;
      byType[match.type]++;
    }

    return {
      total: matches.length,
      bySeverity,
      byType,
    };
  }

  /**
   * Generates recommendations based on conflicts
   */
  private generateRecommendations(matches: ConflictMatch[]): string[] {
    const recommendations: string[] = [];

    const critical = matches.filter((m) => m.severity === "critical");
    const high = matches.filter((m) => m.severity === "high");

    if (critical.length > 0) {
      recommendations.push(
        `${critical.length} critical conflict(s) detected. Do not proceed without senior partner approval.`
      );
    }

    if (high.length > 0) {
      recommendations.push(
        `${high.length} high-severity conflict(s) require conflict waiver before engagement.`
      );
    }

    const opposingPartyConflicts = matches.filter(
      (m) => m.type === "opposing_party"
    );
    if (opposingPartyConflicts.length > 0) {
      recommendations.push("Review opposing party relationships carefully.");
    }

    return recommendations;
  }

  /**
   * Evaluates if rule conditions are met
   */
  private evaluateRuleConditions(
    rule: ConflictRule,
    request: ConflictCheckRequest,
    matches: ConflictMatch[]
  ): boolean {
    if (!rule.enabled) return false;

    // Check if any match satisfies rule conditions
    return matches.some((match) => {
      // Check Entity Type
      const typeMatch =
        rule.conditions.entityTypes.length === 0 ||
        rule.conditions.entityTypes.includes(match.type);

      // Check Relationship
      const relMatch =
        rule.conditions.relationshipTypes.length === 0 ||
        rule.conditions.relationshipTypes.includes(match.relationshipType);

      // Check Practice Area
      const areaMatch =
        !rule.conditions.practiceAreas ||
        rule.conditions.practiceAreas.length === 0 ||
        (request.practiceArea &&
          rule.conditions.practiceAreas.includes(request.practiceArea));

      return typeMatch && relMatch && areaMatch;
    });
  }

  /**
   * Checks if attorney conflict is relevant to case
   */
  private isRelevantToCase(
    conflict: ConflictMatch,
    caseItem: { id: string }
  ): boolean {
    // Check if the conflict involves the case ID directly
    if (
      conflict.matchedEntity.id === caseItem.id ||
      conflict.conflictingEntity.id === caseItem.id
    ) {
      return true;
    }
    // Default to true check for safety in compliance
    return true;
  }

  /**
   * Gets default conflict rules
   */
  private getDefaultRules(): ConflictRule[] {
    return [
      {
        id: "rule-opposing-client",
        name: "Opposing Client Check",
        description: "Block representation against existing clients",
        enabled: true,
        severity: "critical",
        conditions: {
          entityTypes: ["client"],
          relationshipTypes: ["opposing_party"],
        },
        actions: {
          blockOnMatch: true,
          requireWaiver: true,
          notifyUsers: ["ethics_partner"],
        },
      },
    ];
  }

  /**
   * Fetches clients from backend or cache
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async fetchClients(): Promise<any[]> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const response = await fetch(`${baseUrl}/api/clients`, {
      credentials: "include",
    });
    if (response.ok) {
      return await response.json();
    }
    return [];
  }

  /**
   * Fetches client by ID
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async fetchClient(clientId: string): Promise<any> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const response = await fetch(`${baseUrl}/api/clients/${clientId}`, {
      credentials: "include",
    });
    if (response.ok) {
      return await response.json();
    }
    return null;
  }

  /**
   * Fetches cases from backend
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async fetchCases(): Promise<any[]> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const response = await fetch(`${baseUrl}/api/cases`, {
      credentials: "include",
    });
    if (response.ok) {
      return await response.json();
    }
    return [];
  }

  /**
   * Fetches case by ID
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async fetchCase(caseId: string): Promise<any> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const response = await fetch(`${baseUrl}/api/cases/${caseId}`, {
      credentials: "include",
    });
    if (response.ok) {
      return await response.json();
    }
    return null;
  }

  /**
   * Fetches attorney conflicts
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async fetchAttorneyConflicts(attorneyId: string): Promise<any[]> {
    try {
      return await complianceApi.conflictChecks.getAttorneyConflicts(
        attorneyId
      );
    } catch (error) {
      console.warn(
        `[ConflictCheckService] Failed to fetch attorney conflicts for ${attorneyId}`,
        error
      );
      return [];
    }
  }

  /**
   * Loads conflicts from storage
   */
  private loadConflicts(): void {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.conflicts = data.conflicts || [];
        this.waivers = data.waivers || [];
      }
    } catch (error) {
      console.error("Failed to load conflicts:", error);
    }
  }

  /**
   * Saves conflicts to storage
   */
  private async saveConflicts(): Promise<void> {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify({
          conflicts: this.conflicts,
          waivers: this.waivers,
        })
      );
    } catch (error) {
      console.error("Failed to save conflicts:", error);
    }
  }

  /**
   * Generates unique IDs
   */
  private generateRequestId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateConflictId(): string {
    return `conflict-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateWaiverId(): string {
    return `waiver-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const ConflictCheckService = new ConflictCheckServiceClass();
