import { apiClient } from './api/apiClient';

export interface BarAdmission {
  id: string;
  attorneyId: string;
  jurisdiction: string;
  barNumber: string;
  admissionDate: string;
  status: string;
  renewalDate?: string;
  lastVerified: string;
}

export interface BarRequirement {
  id: string;
  jurisdiction: string;
  requirementType: string;
  name: string;
  description: string;
  requiredHours?: number;
  dueDate?: string;
  completed: boolean;
  completionDate?: string;
}

export interface CLECredit {
  id: string;
  attorneyId: string;
  title: string;
  provider: string;
  category: string;
  deliveryMethod: string;
  credits: number;
  jurisdiction: string;
  completionDate: string;
  certificateNumber?: string;
  approved: boolean;
}

export interface CLERequirement {
  jurisdiction: string;
  totalRequired: number;
  ethicsRequired: number;
  currentTotal: number;
  currentEthics: number;
  compliant: boolean;
  deficiency?: number;
}

export interface ConflictCheck {
  id: string;
  matterId: string;
  clientName: string;
  opposingParties: string[];
  performedBy: string;
  performedAt: string;
  conflicts: Conflict[];
  cleared: boolean;
  clearedBy?: string;
  clearedAt?: string;
}

export interface Conflict {
  id: string;
  type: string;
  severity: string;
  description: string;
  affectedClient: string;
  waivable: boolean;
  resolved: boolean;
  resolution?: string;
}

export interface EthicsWall {
  id: string;
  name: string;
  description: string;
  affectedAttorneys: string[];
  screenedMatter: string;
  screenedClient: string;
  effectiveDate: string;
  active: boolean;
}

export interface WaiverOfConflict {
  id: string;
  conflictId: string;
  clientName: string;
  matterId: string;
  conflictDescription: string;
  consentObtained: string;
  informedConsent: boolean;
  revoked: boolean;
}

class EthicsService {
  // Bar Compliance
  async getBarAdmissions(attorneyId: string): Promise<BarAdmission[]> {
    const response = await apiClient.get(`/api/ethics/bar-admissions/${attorneyId}`);
    return response.data;
  }

  async addBarAdmission(
    attorneyId: string,
    jurisdiction: string,
    barNumber: string,
    admissionDate: string,
  ): Promise<BarAdmission> {
    const response = await apiClient.post('/api/ethics/bar-admissions', {
      attorneyId,
      jurisdiction,
      barNumber,
      admissionDate,
    });
    return response.data;
  }

  async verifyBarStatus(admissionId: string): Promise<boolean> {
    const response = await apiClient.post(`/api/ethics/bar-admissions/${admissionId}/verify`);
    return response.data.verified;
  }

  async getBarRequirements(attorneyId: string, jurisdiction?: string): Promise<BarRequirement[]> {
    const response = await apiClient.get(`/api/ethics/bar-requirements/${attorneyId}`, {
      params: { jurisdiction },
    });
    return response.data;
  }

  async completeRequirement(
    requirementId: string,
    completionDate: string,
    documentation?: string[],
  ): Promise<void> {
    await apiClient.post(`/api/ethics/bar-requirements/${requirementId}/complete`, {
      completionDate,
      documentation,
    });
  }

  async checkComplianceStatus(attorneyId: string): Promise<{
    compliant: boolean;
    issues: string[];
    upcomingDeadlines: Array<{ requirement: string; dueDate: string }>;
  }> {
    const response = await apiClient.get(`/api/ethics/bar-compliance/${attorneyId}/status`);
    return response.data;
  }

  // CLE Tracking
  async recordCLECredit(creditData: Partial<CLECredit>): Promise<CLECredit> {
    const response = await apiClient.post('/api/ethics/cle/credits', creditData);
    return response.data;
  }

  async getCLECredits(
    attorneyId: string,
    filters?: {
      jurisdiction?: string;
      category?: string;
      startDate?: string;
      endDate?: string;
      approvedOnly?: boolean;
    },
  ): Promise<CLECredit[]> {
    const response = await apiClient.get(`/api/ethics/cle/credits/${attorneyId}`, {
      params: filters,
    });
    return response.data;
  }

  async approveCLECredit(creditId: string): Promise<void> {
    await apiClient.post(`/api/ethics/cle/credits/${creditId}/approve`);
  }

  async calculateCLERequirements(
    attorneyId: string,
    jurisdiction: string,
  ): Promise<CLERequirement> {
    const response = await apiClient.get(`/api/ethics/cle/requirements/${attorneyId}`, {
      params: { jurisdiction },
    });
    return response.data;
  }

  async getCLESummary(
    attorneyId: string,
    jurisdiction: string,
  ): Promise<{
    currentYear: CLERequirement;
    totalCredits: number;
    totalEthics: number;
    creditsByCategory: Record<string, number>;
    recentCredits: CLECredit[];
  }> {
    const response = await apiClient.get(`/api/ethics/cle/summary/${attorneyId}`, {
      params: { jurisdiction },
    });
    return response.data;
  }

  async deleteCLECredit(creditId: string): Promise<void> {
    await apiClient.delete(`/api/ethics/cle/credits/${creditId}`);
  }

  async exportCLECredits(
    attorneyId: string,
    jurisdiction: string,
    reportingPeriod: { start: string; end: string },
  ): Promise<Blob> {
    const response = await apiClient.get(`/api/ethics/cle/export/${attorneyId}`, {
      params: { jurisdiction, ...reportingPeriod },
      responseType: 'blob',
    });
    return response.data;
  }

  // Conflict Checks
  async performConflictCheck(
    matterId: string,
    clientName: string,
    opposingParties: string[],
    relatedParties: string[],
    matterType: string,
    description: string,
  ): Promise<ConflictCheck> {
    const response = await apiClient.post('/api/ethics/conflicts/check', {
      matterId,
      clientName,
      opposingParties,
      relatedParties,
      matterType,
      description,
    });
    return response.data;
  }

  async getConflictChecks(matterId?: string): Promise<ConflictCheck[]> {
    const response = await apiClient.get('/api/ethics/conflicts/checks', {
      params: { matterId },
    });
    return response.data;
  }

  async clearConflictCheck(checkId: string, notes?: string): Promise<void> {
    await apiClient.post(`/api/ethics/conflicts/checks/${checkId}/clear`, { notes });
  }

  async obtainWaiver(
    conflictId: string,
    clientId: string,
    clientName: string,
    matterId: string,
    consentForm: string,
    informedConsent: boolean,
  ): Promise<WaiverOfConflict> {
    const response = await apiClient.post('/api/ethics/conflicts/waivers', {
      conflictId,
      clientId,
      clientName,
      matterId,
      consentForm,
      informedConsent,
    });
    return response.data;
  }

  async getWaivers(matterId?: string): Promise<WaiverOfConflict[]> {
    const response = await apiClient.get('/api/ethics/conflicts/waivers', {
      params: { matterId },
    });
    return response.data;
  }

  async revokeWaiver(waiverId: string): Promise<void> {
    await apiClient.post(`/api/ethics/conflicts/waivers/${waiverId}/revoke`);
  }

  // Ethics Walls
  async implementEthicsWall(wallData: {
    name: string;
    description: string;
    affectedAttorneys: string[];
    screenedMatter: string;
    screenedClient: string;
    procedures: string[];
    monitoringMeasures: string[];
  }): Promise<EthicsWall> {
    const response = await apiClient.post('/api/ethics/walls', wallData);
    return response.data;
  }

  async getActiveEthicsWalls(attorneyId?: string): Promise<EthicsWall[]> {
    const response = await apiClient.get('/api/ethics/walls', {
      params: { attorneyId },
    });
    return response.data;
  }

  async reportWallBreach(wallId: string, breachDetails: string): Promise<void> {
    await apiClient.post(`/api/ethics/walls/${wallId}/breach`, { breachDetails });
  }

  async deactivateEthicsWall(wallId: string): Promise<void> {
    await apiClient.post(`/api/ethics/walls/${wallId}/deactivate`);
  }

  // Professional Responsibility
  async getComplianceStatus(): Promise<{
    totalRules: number;
    compliant: number;
    nonCompliant: number;
    complianceRate: number;
    criticalIssues: string[];
  }> {
    const response = await apiClient.get('/api/ethics/professional-responsibility/status');
    return response.data;
  }

  async reviewCompliance(
    rule: string,
    compliant: boolean,
    evidence: string[],
    findings: string[],
  ): Promise<void> {
    await apiClient.post('/api/ethics/professional-responsibility/review', {
      rule,
      compliant,
      evidence,
      findings,
    });
  }

  async reportIncident(
    rule: string,
    description: string,
    severity: string,
    attorneyInvolved: string,
    matterInvolved?: string,
  ): Promise<{ id: string }> {
    const response = await apiClient.post('/api/ethics/professional-responsibility/incidents', {
      rule,
      description,
      severity,
      attorneyInvolved,
      matterInvolved,
    });
    return response.data;
  }

  async getActiveIncidents(): Promise<Array<{
    id: string;
    rule: string;
    description: string;
    severity: string;
    reportedAt: string;
    attorneyInvolved: string;
  }>> {
    const response = await apiClient.get('/api/ethics/professional-responsibility/incidents/active');
    return response.data;
  }

  // Trust Accounts
  async createTrustAccount(
    accountNumber: string,
    bankName: string,
    clientId: string,
    clientName: string,
    matterId: string,
  ): Promise<{ id: string }> {
    const response = await apiClient.post('/api/ethics/trust-accounts', {
      accountNumber,
      bankName,
      clientId,
      clientName,
      matterId,
    });
    return response.data;
  }

  async recordTrustTransaction(
    accountId: string,
    type: string,
    amount: number,
    description: string,
    purpose: string,
  ): Promise<void> {
    await apiClient.post(`/api/ethics/trust-accounts/${accountId}/transactions`, {
      type,
      amount,
      description,
      purpose,
    });
  }

  async reconcileTrustAccount(
    accountId: string,
    statementBalance: number,
  ): Promise<{
    reconciled: boolean;
    difference: number;
    issues: string[];
  }> {
    const response = await apiClient.post(`/api/ethics/trust-accounts/${accountId}/reconcile`, {
      statementBalance,
    });
    return response.data;
  }

  async getTrustAccounts(clientId?: string): Promise<Array<{
    id: string;
    accountNumber: string;
    clientName: string;
    currentBalance: number;
    lastReconciled: string;
  }>> {
    const response = await apiClient.get('/api/ethics/trust-accounts', {
      params: { clientId },
    });
    return response.data;
  }
}

export const ethicsService = new EthicsService();
export default ethicsService;
