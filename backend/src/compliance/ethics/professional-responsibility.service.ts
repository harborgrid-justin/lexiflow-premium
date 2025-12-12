import { Injectable, Logger } from '@nestjs/common';

export enum PRRule {
  // ABA Model Rules
  COMPETENCE = 'RULE_1.1', // Competence
  SCOPE_OF_REPRESENTATION = 'RULE_1.2', // Scope of Representation
  DILIGENCE = 'RULE_1.3', // Diligence
  COMMUNICATION = 'RULE_1.4', // Communication
  FEES = 'RULE_1.5', // Fees
  CONFIDENTIALITY = 'RULE_1.6', // Confidentiality
  CONFLICT_OF_INTEREST = 'RULE_1.7', // Conflict of Interest: Current Clients
  FORMER_CLIENT_CONFLICT = 'RULE_1.8', // Conflict of Interest: Current Clients: Specific Rules
  DUTIES_TO_FORMER_CLIENT = 'RULE_1.9', // Duties to Former Clients
  IMPUTED_DISQUALIFICATION = 'RULE_1.10', // Imputation of Conflicts of Interest
  SPECIAL_CONFLICTS = 'RULE_1.11', // Special Conflicts of Interest
  SAFEKEEPING_PROPERTY = 'RULE_1.15', // Safekeeping Property
  DECLINING_REPRESENTATION = 'RULE_1.16', // Declining or Terminating Representation
  CANDOR_TO_TRIBUNAL = 'RULE_3.3', // Candor Toward the Tribunal
  FAIRNESS_TO_OPPONENT = 'RULE_3.4', // Fairness to Opposing Party and Counsel
  TRIAL_PUBLICITY = 'RULE_3.6', // Trial Publicity
  TRUTHFULNESS = 'RULE_4.1', // Truthfulness in Statements to Others
  COMMUNICATION_WITH_REPRESENTED = 'RULE_4.2', // Communication with Person Represented by Counsel
  DEALING_WITH_UNREPRESENTED = 'RULE_4.3', // Dealing with Unrepresented Person
  UNAUTHORIZED_PRACTICE = 'RULE_5.5', // Unauthorized Practice of Law
  PROFESSIONAL_INDEPENDENCE = 'RULE_5.4', // Professional Independence of a Lawyer
  REPORTING_MISCONDUCT = 'RULE_8.3', // Reporting Professional Misconduct
  MISCONDUCT = 'RULE_8.4', // Misconduct
}

export interface PRCompliance {
  id: string;
  rule: PRRule;
  description: string;
  compliant: boolean;
  lastReviewed: Date;
  reviewedBy: string;
  evidence: string[];
  findings: string[];
  correctiveActions: string[];
}

export interface PRIncident {
  id: string;
  rule: PRRule;
  description: string;
  severity: 'MINOR' | 'MODERATE' | 'SERIOUS' | 'SEVERE';
  reportedAt: Date;
  reportedBy: string;
  attorneyInvolved: string;
  matterInvolved?: string;
  investigation: PRInvestigation;
  resolved: boolean;
  resolution?: string;
  resolvedAt?: Date;
  disciplinaryAction?: DisciplinaryAction;
}

export interface PRInvestigation {
  opened: Date;
  investigator: string;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'DISMISSED';
  findings: string[];
  interviews: Interview[];
  documents: string[];
  conclusion?: string;
  completedAt?: Date;
}

export interface Interview {
  date: Date;
  interviewee: string;
  interviewer: string;
  summary: string;
  transcript?: string;
}

export interface DisciplinaryAction {
  id: string;
  type: 'WARNING' | 'REPRIMAND' | 'SUSPENSION' | 'PROBATION' | 'TERMINATION';
  description: string;
  effectiveDate: Date;
  duration?: number; // in days
  conditions?: string[];
  appealable: boolean;
  appealed: boolean;
  appealDate?: Date;
}

export interface ClientTrustAccount {
  id: string;
  accountNumber: string;
  bankName: string;
  clientId: string;
  clientName: string;
  matterId: string;
  openedDate: Date;
  closedDate?: Date;
  currentBalance: number;
  transactions: TrustTransaction[];
  lastReconciled: Date;
  reconciledBy?: string;
}

export interface TrustTransaction {
  id: string;
  date: Date;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'INTEREST' | 'FEE' | 'TRANSFER';
  amount: number;
  description: string;
  checkNumber?: string;
  authorizedBy: string;
  purpose: string;
  relatedInvoice?: string;
}

@Injectable()
export class ProfessionalResponsibilityService {
  private readonly logger = new Logger(ProfessionalResponsibilityService.name);
  private compliance: Map<PRRule, PRCompliance> = new Map();
  private incidents: Map<string, PRIncident> = new Map();
  private trustAccounts: Map<string, ClientTrustAccount> = new Map();

  constructor() {
    this.initializeCompliance();
  }

  /**
   * Initialize compliance tracking for PR rules
   */
  private initializeCompliance(): void {
    const rules = Object.values(PRRule);

    rules.forEach(rule => {
      const compliance: PRCompliance = {
        id: `compliance-${rule}`,
        rule,
        description: this.getRuleDescription(rule),
        compliant: true,
        lastReviewed: new Date(),
        reviewedBy: 'System',
        evidence: [],
        findings: [],
        correctiveActions: [],
      };

      this.compliance.set(rule, compliance);
    });

    this.logger.log(`Initialized professional responsibility compliance tracking for ${rules.length} rules`);
  }

  /**
   * Get rule description
   */
  private getRuleDescription(rule: PRRule): string {
    const descriptions: Record<PRRule, string> = {
      [PRRule.COMPETENCE]: 'Provide competent representation with requisite knowledge, skill, thoroughness and preparation',
      [PRRule.SCOPE_OF_REPRESENTATION]: 'Abide by client decisions concerning objectives and consult with client about means',
      [PRRule.DILIGENCE]: 'Act with reasonable diligence and promptness in representing a client',
      [PRRule.COMMUNICATION]: 'Keep client reasonably informed about status of matter and promptly comply with reasonable requests',
      [PRRule.FEES]: 'Charge only reasonable fees and communicate basis or rate in writing',
      [PRRule.CONFIDENTIALITY]: 'Not reveal information relating to representation of client',
      [PRRule.CONFLICT_OF_INTEREST]: 'No representation adverse to current client without informed consent',
      [PRRule.FORMER_CLIENT_CONFLICT]: 'Avoid conflicts involving current and former clients',
      [PRRule.DUTIES_TO_FORMER_CLIENT]: 'Not use information relating to representation to disadvantage of former client',
      [PRRule.IMPUTED_DISQUALIFICATION]: 'Conflicts of one lawyer imputed to all in firm unless screened',
      [PRRule.SPECIAL_CONFLICTS]: 'Special conflict rules for government officers and employees',
      [PRRule.SAFEKEEPING_PROPERTY]: 'Hold client property separate from lawyer property',
      [PRRule.DECLINING_REPRESENTATION]: 'Proper procedures for declining or terminating representation',
      [PRRule.CANDOR_TO_TRIBUNAL]: 'Not knowingly make false statement to tribunal or offer false evidence',
      [PRRule.FAIRNESS_TO_OPPONENT]: 'Fairness to opposing party and counsel',
      [PRRule.TRIAL_PUBLICITY]: 'Avoid extrajudicial statements with substantial likelihood of material prejudice',
      [PRRule.TRUTHFULNESS]: 'Not knowingly make false statement of material fact or law',
      [PRRule.COMMUNICATION_WITH_REPRESENTED]: 'Not communicate with person represented by counsel without consent',
      [PRRule.DEALING_WITH_UNREPRESENTED]: 'Clarify role when dealing with unrepresented persons',
      [PRRule.UNAUTHORIZED_PRACTICE]: 'Not practice law in violation of regulations or assist non-lawyer in unauthorized practice',
      [PRRule.PROFESSIONAL_INDEPENDENCE]: 'Maintain professional independence from clients and third parties',
      [PRRule.REPORTING_MISCONDUCT]: 'Report knowledge of violation raising substantial question about fitness',
      [PRRule.MISCONDUCT]: 'Professional misconduct to violate rules, commit criminal acts, engage in dishonesty, etc.',
    };

    return descriptions[rule] || 'Professional responsibility rule';
  }

  /**
   * Review compliance with PR rule
   */
  async reviewCompliance(
    rule: PRRule,
    reviewedBy: string,
    compliant: boolean,
    evidence: string[],
    findings: string[],
    correctiveActions?: string[],
  ): Promise<PRCompliance> {
    const compliance = this.compliance.get(rule);
    if (!compliance) {
      throw new Error(`Compliance record not found for rule: ${rule}`);
    }

    compliance.compliant = compliant;
    compliance.lastReviewed = new Date();
    compliance.reviewedBy = reviewedBy;
    compliance.evidence = evidence;
    compliance.findings = findings;
    compliance.correctiveActions = correctiveActions || [];

    this.compliance.set(rule, compliance);

    if (!compliant) {
      this.logger.warn(`Non-compliance identified for ${rule}: ${findings.join(', ')}`);
    } else {
      this.logger.log(`Compliance confirmed for ${rule} by ${reviewedBy}`);
    }

    return compliance;
  }

  /**
   * Report PR incident
   */
  async reportIncident(
    rule: PRRule,
    description: string,
    severity: PRIncident['severity'],
    reportedBy: string,
    attorneyInvolved: string,
    matterInvolved?: string,
  ): Promise<PRIncident> {
    const incident: PRIncident = {
      id: `incident-${Date.now()}`,
      rule,
      description,
      severity,
      reportedAt: new Date(),
      reportedBy,
      attorneyInvolved,
      matterInvolved,
      investigation: {
        opened: new Date(),
        investigator: 'Compliance Officer',
        status: 'PENDING',
        findings: [],
        interviews: [],
        documents: [],
      },
      resolved: false,
    };

    this.incidents.set(incident.id, incident);

    this.logger.error(
      `PR incident reported: ${rule} - ${severity} - Attorney: ${attorneyInvolved}`,
    );

    // Update compliance status
    const compliance = this.compliance.get(rule);
    if (compliance) {
      compliance.compliant = false;
      compliance.findings.push(description);
      this.compliance.set(rule, compliance);
    }

    return incident;
  }

  /**
   * Update investigation
   */
  async updateInvestigation(
    incidentId: string,
    updates: {
      status?: PRInvestigation['status'];
      findings?: string[];
      interviews?: Interview[];
      documents?: string[];
      conclusion?: string;
    },
  ): Promise<void> {
    const incident = this.incidents.get(incidentId);
    if (!incident) {
      throw new Error(`Incident not found: ${incidentId}`);
    }

    if (updates.status) {
      incident.investigation.status = updates.status;
    }

    if (updates.findings) {
      incident.investigation.findings.push(...updates.findings);
    }

    if (updates.interviews) {
      incident.investigation.interviews.push(...updates.interviews);
    }

    if (updates.documents) {
      incident.investigation.documents.push(...updates.documents);
    }

    if (updates.conclusion) {
      incident.investigation.conclusion = updates.conclusion;
      incident.investigation.status = 'COMPLETED';
      incident.investigation.completedAt = new Date();
    }

    this.incidents.set(incidentId, incident);

    this.logger.log(`Investigation updated for incident ${incidentId}`);
  }

  /**
   * Take disciplinary action
   */
  async takeDisciplinaryAction(
    incidentId: string,
    actionType: DisciplinaryAction['type'],
    description: string,
    effectiveDate: Date,
    duration?: number,
    conditions?: string[],
  ): Promise<void> {
    const incident = this.incidents.get(incidentId);
    if (!incident) {
      throw new Error(`Incident not found: ${incidentId}`);
    }

    const action: DisciplinaryAction = {
      id: `action-${Date.now()}`,
      type: actionType,
      description,
      effectiveDate,
      duration,
      conditions,
      appealable: true,
      appealed: false,
    };

    incident.disciplinaryAction = action;
    incident.resolved = true;
    incident.resolution = `Disciplinary action: ${actionType}`;
    incident.resolvedAt = new Date();

    this.incidents.set(incidentId, incident);

    this.logger.warn(
      `Disciplinary action taken for incident ${incidentId}: ${actionType}`,
    );
  }

  /**
   * Manage client trust account
   */
  async createTrustAccount(
    accountNumber: string,
    bankName: string,
    clientId: string,
    clientName: string,
    matterId: string,
  ): Promise<ClientTrustAccount> {
    const account: ClientTrustAccount = {
      id: `trust-${Date.now()}`,
      accountNumber,
      bankName,
      clientId,
      clientName,
      matterId,
      openedDate: new Date(),
      currentBalance: 0,
      transactions: [],
      lastReconciled: new Date(),
    };

    this.trustAccounts.set(account.id, account);

    this.logger.log(
      `Trust account created for client ${clientName}, matter ${matterId}`,
    );

    return account;
  }

  /**
   * Record trust transaction
   */
  async recordTrustTransaction(
    accountId: string,
    type: TrustTransaction['type'],
    amount: number,
    description: string,
    authorizedBy: string,
    purpose: string,
    checkNumber?: string,
    relatedInvoice?: string,
  ): Promise<void> {
    const account = this.trustAccounts.get(accountId);
    if (!account) {
      throw new Error(`Trust account not found: ${accountId}`);
    }

    const transaction: TrustTransaction = {
      id: `txn-${Date.now()}`,
      date: new Date(),
      type,
      amount,
      description,
      checkNumber,
      authorizedBy,
      purpose,
      relatedInvoice,
    };

    account.transactions.push(transaction);

    // Update balance
    if (type === 'DEPOSIT' || type === 'INTEREST') {
      account.currentBalance += amount;
    } else if (type === 'WITHDRAWAL' || type === 'FEE') {
      account.currentBalance -= amount;
    }

    this.trustAccounts.set(accountId, account);

    this.logger.log(
      `Trust transaction recorded: ${type} $${amount} for account ${account.accountNumber}`,
    );
  }

  /**
   * Reconcile trust account
   */
  async reconcileTrustAccount(
    accountId: string,
    reconciledBy: string,
    statementBalance: number,
  ): Promise<{
    reconciled: boolean;
    difference: number;
    issues: string[];
  }> {
    const account = this.trustAccounts.get(accountId);
    if (!account) {
      throw new Error(`Trust account not found: ${accountId}`);
    }

    const difference = Math.abs(account.currentBalance - statementBalance);
    const reconciled = difference < 0.01; // Allow for rounding errors
    const issues: string[] = [];

    if (!reconciled) {
      issues.push(
        `Balance mismatch: System shows $${account.currentBalance.toFixed(2)}, bank statement shows $${statementBalance.toFixed(2)}`,
      );
    }

    account.lastReconciled = new Date();
    account.reconciledBy = reconciledBy;
    this.trustAccounts.set(accountId, account);

    if (!reconciled) {
      this.logger.error(
        `Trust account reconciliation failed for ${account.accountNumber}: Difference $${difference.toFixed(2)}`,
      );
    } else {
      this.logger.log(
        `Trust account reconciled successfully for ${account.accountNumber} by ${reconciledBy}`,
      );
    }

    return { reconciled, difference, issues };
  }

  /**
   * Get compliance status
   */
  async getComplianceStatus(): Promise<{
    totalRules: number;
    compliant: number;
    nonCompliant: number;
    complianceRate: number;
    criticalIssues: string[];
  }> {
    const allCompliance = Array.from(this.compliance.values());

    const compliant = allCompliance.filter(c => c.compliant).length;
    const nonCompliant = allCompliance.length - compliant;
    const complianceRate = (compliant / allCompliance.length) * 100;

    const criticalIssues = allCompliance
      .filter(c => !c.compliant)
      .map(c => `${c.rule}: ${c.findings.join(', ')}`);

    return {
      totalRules: allCompliance.length,
      compliant,
      nonCompliant,
      complianceRate,
      criticalIssues,
    };
  }

  /**
   * Get active incidents
   */
  async getActiveIncidents(): Promise<PRIncident[]> {
    return Array.from(this.incidents.values())
      .filter(i => !i.resolved)
      .sort((a, b) => b.reportedAt.getTime() - a.reportedAt.getTime());
  }

  /**
   * Get trust accounts
   */
  async getTrustAccounts(clientId?: string): Promise<ClientTrustAccount[]> {
    let accounts = Array.from(this.trustAccounts.values()).filter(a => !a.closedDate);

    if (clientId) {
      accounts = accounts.filter(a => a.clientId === clientId);
    }

    return accounts;
  }

  /**
   * Get accounts needing reconciliation
   */
  async getAccountsNeedingReconciliation(daysSince: number = 30): Promise<ClientTrustAccount[]> {
    const cutoffDate = new Date(Date.now() - daysSince * 24 * 60 * 60 * 1000);

    return Array.from(this.trustAccounts.values()).filter(
      a => !a.closedDate && a.lastReconciled < cutoffDate,
    );
  }
}
