/**
 * Enterprise Legal Domain Type Definitions
 * Comprehensive type coverage for all 8 PRIMARY business domains
 *
 * This file provides type safety for domain models used across the Next.js application
 * and ensures consistency with backend NestJS API DTOs.
 */

// ==================== DOMAIN 01: MATTER LIFECYCLE MANAGEMENT ====================

export interface MatterIntakeForm {
  id: string;
  clientName: string;
  contactEmail: string;
  contactPhone: string;
  matterType: string;
  jurisdiction: string;
  opposingParty?: string;
  caseDescription: string;
  estimatedValue?: number;
  urgency: "low" | "medium" | "high" | "critical";
  conflictCheckStatus: "pending" | "cleared" | "conflicts_found";
  assignedAttorney?: string;
  status: "draft" | "submitted" | "under_review" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

export interface ConflictCheck {
  id: string;
  matterId: string;
  checkDate: Date;
  parties: string[];
  relatedMatters: string[];
  conflictFound: boolean;
  conflictDetails?: string;
  clearanceLevel: "auto" | "manual_review" | "ethics_committee";
  clearedBy?: string;
  clearedAt?: Date;
}

export interface EngagementLetter {
  id: string;
  matterId: string;
  clientId: string;
  templateId: string;
  scopeOfWork: string;
  feeStructure: "hourly" | "flat_fee" | "contingency" | "hybrid";
  hourlyRates: Record<string, number>;
  estimatedCost?: number;
  retainerAmount?: number;
  billingFrequency: "monthly" | "milestone" | "completion";
  signedAt?: Date;
  signedBy?: string;
  status: "draft" | "sent" | "signed" | "expired";
}

// ==================== DOMAIN 02: LEGAL RESEARCH & INTELLIGENCE ====================

export interface CaseLawResearch {
  id: string;
  query: string;
  jurisdiction: string[];
  dateRange?: { from: Date; to: Date };
  courtLevels: ("supreme" | "appellate" | "district" | "trial")[];
  results: ResearchResult[];
  totalFound: number;
  shepardized: boolean;
  createdBy: string;
  createdAt: Date;
}

export interface ResearchResult {
  id: string;
  citation: string;
  caseName: string;
  court: string;
  decisionDate: Date;
  judges: string[];
  keyHoldings: string[];
  relevanceScore: number;
  treatmentStatus: "good_law" | "questioned" | "overruled" | "distinguished";
  citedByCount: number;
  pdfUrl?: string;
}

export interface JudicialAnalytics {
  judgeId: string;
  judgeName: string;
  court: string;
  appointmentDate: Date;
  motionGrantRates: Record<string, number>;
  averageCaseDuration: number;
  settlementRate: number;
  verdictHistory: { plaintiff: number; defendant: number };
  specialties: string[];
  predictedOutcome?: number; // 0-1 probability
}

// ==================== DOMAIN 03: DISCOVERY & EVIDENCE MANAGEMENT ====================

export interface DiscoveryRequest {
  id: string;
  caseId: string;
  requestType:
    | "interrogatories"
    | "rfa"
    | "rfp"
    | "subpoena"
    | "deposition_notice";
  requestNumber: string;
  servedDate: Date;
  dueDate: Date;
  respondingParty: string;
  itemsRequested: DiscoveryItem[];
  status: "draft" | "served" | "responded" | "objected" | "completed";
  responses?: DiscoveryResponse[];
}

export interface DiscoveryItem {
  itemNumber: string;
  category: string;
  description: string;
  dateRange?: { from: Date; to: Date };
  custodians?: string[];
  searchTerms?: string[];
}

export interface EvidenceVault {
  id: string;
  caseId: string;
  exhibitNumber: string;
  description: string;
  evidenceType:
    | "document"
    | "physical"
    | "digital"
    | "testimony"
    | "demonstrative";
  chainOfCustody: CustodyLog[];
  authenticatedBy?: string;
  admissibilityStatus: "pending" | "admitted" | "excluded" | "limited";
  batesRange?: { start: string; end: string };
  tags: string[];
  confidentialityLevel:
    | "public"
    | "attorneys_eyes_only"
    | "highly_confidential";
}

export interface CustodyLog {
  timestamp: Date;
  action: "collected" | "transferred" | "reviewed" | "copied" | "produced";
  actor: string;
  location: string;
  hash?: string; // Blockchain hash for immutability
  notes?: string;
}

// ==================== DOMAIN 04: DOCUMENT MANAGEMENT & AUTOMATION ====================

export interface LegalDocument {
  id: string;
  title: string;
  documentType: string;
  caseId?: string;
  matterId?: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  versionHistory: DocumentVersion[];
  currentVersion: number;
  ocrProcessed: boolean;
  fullTextContent?: string;
  metadata: DocumentMetadata;
  tags: string[];
  folderId?: string;
  permissions: DocumentPermission[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentVersion {
  version: number;
  fileUrl: string;
  changedBy: string;
  changedAt: Date;
  changeNotes?: string;
  diffUrl?: string;
}

export interface DocumentMetadata {
  author?: string;
  subject?: string;
  keywords?: string[];
  pageCount?: number;
  wordCount?: number;
  creationDate?: Date;
  modificationDate?: Date;
  customFields?: Record<string, unknown>;
}

export interface PleadingTemplate {
  id: string;
  name: string;
  jurisdiction: string;
  courtLevel: string;
  pleadingType: string;
  templateContent: string;
  variables: TemplateVariable[];
  clauseReferences: string[];
  usageCount: number;
  lastUsed?: Date;
  approvedBy?: string;
  version: number;
}

export interface TemplateVariable {
  name: string;
  type: "text" | "date" | "number" | "boolean" | "select";
  required: boolean;
  defaultValue?: unknown;
  validationRules?: Record<string, unknown>;
  options?: string[];
}

// ==================== DOMAIN 05: LITIGATION & TRIAL MANAGEMENT ====================

export interface TrialPreparation {
  id: string;
  caseId: string;
  trialDate: Date;
  venue: string;
  judgeName: string;
  estimatedDuration: number; // days
  witnessPrep: WitnessPreparation[];
  exhibitList: ExhibitPlan[];
  openingStatement?: string;
  closingStatement?: string;
  juryInstructions?: string[];
  motionsInLimine: Motion[];
  trialBinder: TrialBinderSection[];
}

export interface WitnessPreparation {
  witnessId: string;
  witnessName: string;
  witnessType: "fact" | "expert" | "character";
  prepSessions: PrepSession[];
  keyTestimony: string[];
  vulnerabilities: string[];
  exhibits: string[];
  estimatedDuration: number; // minutes
}

export interface Motion {
  id: string;
  caseId: string;
  motionType: string;
  filedDate: Date;
  hearingDate?: Date;
  movingParty: string;
  opposingParty: string;
  legalIssues: string[];
  citedCases: string[];
  status:
    | "filed"
    | "briefed"
    | "argued"
    | "granted"
    | "denied"
    | "partially_granted";
  outcome?: string;
  orderUrl?: string;
}

export interface WarRoom {
  id: string;
  caseId: string;
  sessionDate: Date;
  attendees: string[];
  agenda: string[];
  notes: string;
  actionItems: ActionItem[];
  documentsShared: string[];
  nextMeetingDate?: Date;
}

// ==================== DOMAIN 06: FIRM OPERATIONS & ADMINISTRATION ====================

export interface TimeEntry {
  id: string;
  userId: string;
  matterId: string;
  taskCode: string;
  description: string;
  date: Date;
  hours: number;
  billableRate: number;
  billableAmount: number;
  invoiceId?: string;
  status: "draft" | "submitted" | "approved" | "invoiced" | "written_off";
  createdAt: Date;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  matterId: string;
  clientId: string;
  billingPeriod: { start: Date; end: Date };
  timeEntries: string[];
  expenses: string[];
  subtotal: number;
  taxes: number;
  total: number;
  amountPaid: number;
  balance: number;
  dueDate: Date;
  status:
    | "draft"
    | "sent"
    | "partially_paid"
    | "paid"
    | "overdue"
    | "written_off";
  ledesFormat?: string;
  sentAt?: Date;
}

export interface TrustAccount {
  id: string;
  accountNumber: string;
  clientId: string;
  matterId: string;
  balance: number;
  transactions: TrustTransaction[];
  reconciliationStatus: "current" | "pending" | "discrepancy";
  lastReconciledDate?: Date;
  ioltaEligible: boolean;
}

export interface TrustTransaction {
  id: string;
  trustAccountId: string;
  date: Date;
  type: "deposit" | "withdrawal" | "transfer" | "interest";
  amount: number;
  description: string;
  checkNumber?: string;
  recipientPayee?: string;
  referenceNumber?: string;
  createdBy: string;
}

// ==================== DOMAIN 07: COMMUNICATION & COLLABORATION ====================

export interface SecureMessage {
  id: string;
  threadId: string;
  senderId: string;
  recipientIds: string[];
  subject: string;
  body: string;
  attachments: MessageAttachment[];
  privileged: boolean;
  expiresAt?: Date;
  readReceipts: ReadReceipt[];
  encrypted: boolean;
  sentAt: Date;
}

export interface MessageAttachment {
  id: string;
  filename: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  encrypted: boolean;
}

export interface Correspondence {
  id: string;
  caseId: string;
  matterId: string;
  direction: "inbound" | "outbound";
  correspondenceType: "email" | "letter" | "memo" | "fax";
  from: string;
  to: string[];
  cc?: string[];
  subject: string;
  body: string;
  receivedDate?: Date;
  sentDate?: Date;
  attachments: string[];
  tags: string[];
}

export interface CourtDate {
  id: string;
  caseId: string;
  eventType: string;
  eventDate: Date;
  endDate?: Date;
  location: string;
  judgeName?: string;
  attendees: string[];
  description: string;
  reminderSent: boolean;
  status: "scheduled" | "confirmed" | "continued" | "completed" | "cancelled";
}

// ==================== DOMAIN 08: ANALYTICS & BUSINESS INTELLIGENCE ====================

export interface FirmMetrics {
  period: { start: Date; end: Date };
  financialMetrics: FinancialMetrics;
  performanceMetrics: PerformanceMetrics;
  clientMetrics: ClientMetrics;
  operationalMetrics: OperationalMetrics;
}

export interface FinancialMetrics {
  revenue: number;
  revenueGrowth: number;
  billableHours: number;
  nonBillableHours: number;
  realizationRate: number;
  collectionRate: number;
  workInProgress: number;
  accountsReceivable: number;
  profitMargin: number;
}

export interface PerformanceMetrics {
  averageTimeToClose: number;
  caseVelocity: number;
  attorneyUtilization: Record<string, number>;
  matterProfitability: Record<string, number>;
  writeOffRate: number;
}

export interface ClientMetrics {
  totalClients: number;
  activeMatters: number;
  clientSatisfactionScore: number;
  clientRetentionRate: number;
  clientAcquisitionCost: number;
  lifetimeClientValue: number;
}

export interface OperationalMetrics {
  taskCompletionRate: number;
  deadlineComplianceRate: number;
  documentProcessingTime: number;
  averageResponseTime: number;
  systemUptime: number;
}

// ==================== SHARED TYPES ====================

export interface ActionItem {
  id: string;
  title: string;
  description?: string;
  assignedTo: string;
  dueDate: Date;
  priority: "low" | "medium" | "high" | "urgent";
  status: "todo" | "in_progress" | "blocked" | "completed";
  completedAt?: Date;
  relatedEntity: { type: string; id: string };
}

export interface DocumentPermission {
  userId?: string;
  roleId?: string;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canShare: boolean;
  grantedBy: string;
  grantedAt: Date;
}

export interface PrepSession {
  date: Date;
  duration: number;
  attendees: string[];
  topics: string[];
  notes: string;
  followUpActions: string[];
}

export interface ExhibitPlan {
  exhibitNumber: string;
  description: string;
  evidenceId: string;
  admissionStatus: "pending" | "admitted" | "excluded";
  presentationOrder: number;
  estimatedTime: number;
}

export interface TrialBinderSection {
  sectionName: string;
  tabNumber: number;
  documents: string[];
  notes?: string;
}

export interface ReadReceipt {
  userId: string;
  readAt: Date;
}

// ==================== API RESPONSE TYPES ====================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface BulkOperationResult {
  successful: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
}
