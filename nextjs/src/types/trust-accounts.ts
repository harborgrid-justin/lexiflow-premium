// types/trust-accounts.ts
// Trust Account Type Definitions - Backend Entity Synchronized
// Generated from: backend/src/billing/trust-accounts/entities/trust-account.entity.ts
// Generated from: backend/src/billing/trust-accounts/entities/trust-transaction.entity.ts
// Last sync: 2025-01-XX

import { BaseEntity, CaseId, EntityId, Money, UserId } from "./primitives";

/**
 * Trust Account Types - Matches backend TrustAccountType enum
 * @see backend/src/billing/trust-accounts/entities/trust-account.entity.ts
 */
export enum TrustAccountType {
  IOLTA = "iolta",
  CLIENT_TRUST = "client_trust",
  OPERATING = "operating",
}

/**
 * Trust Account Status - Matches backend TrustAccountStatus enum
 * @see backend/src/billing/trust-accounts/entities/trust-account.entity.ts
 */
export enum TrustAccountStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  CLOSED = "closed",
  SUSPENDED = "suspended",
}

/**
 * Payment Method - Controls cash withdrawal prohibition
 * CASH and ATM methods are prohibited for trust account withdrawals per state bar rules
 */
export enum PaymentMethod {
  CHECK = "check", // Pre-numbered checks required
  WIRE = "wire", // Electronic wire transfer
  ACH = "ach", // ACH electronic transfer
  EFT = "eft", // Generic electronic funds transfer
  CASH = "cash", // PROHIBITED for withdrawals - compliance violation
  ATM = "atm", // PROHIBITED - compliance violation
}

/**
 * Reconciliation Status - Three-way reconciliation tracking
 * Per state bar requirements: bank statement + main ledger + client ledgers
 */
export enum ReconciliationStatus {
  PENDING = "pending", // Not yet reconciled
  IN_PROGRESS = "in_progress", // Reconciliation in progress
  RECONCILED = "reconciled", // Fully reconciled (three-way match)
  DISCREPANCY = "discrepancy", // Discrepancy found during reconciliation
  NEEDS_REVIEW = "needs_review", // Flagged for attorney review
}

/**
 * Trust Transaction Type - Matches backend TransactionType enum
 * @see backend/src/billing/trust-accounts/entities/trust-transaction.entity.ts
 */
export enum TransactionType {
  DEPOSIT = "deposit",
  WITHDRAWAL = "withdrawal",
  TRANSFER = "transfer",
  INTEREST = "interest",
  FEE = "fee",
  ADJUSTMENT = "adjustment",
  REFUND = "refund",
}

/**
 * Trust Transaction Status - Matches backend TransactionStatus enum
 * @see backend/src/billing/trust-accounts/entities/trust-transaction.entity.ts
 */
export enum TransactionStatus {
  PENDING = "pending",
  CLEARED = "cleared",
  RECONCILED = "reconciled",
  CANCELLED = "cancelled",
  FAILED = "failed",
}

/**
 * Trust Account Entity - Complete 1:1 mapping with backend
 * COMPLIANCE: Meets state bar requirements for trust account management
 *
 * @see backend/src/billing/trust-accounts/entities/trust-account.entity.ts
 * @see backend/src/billing/trust-accounts/dto/create-trust-account.dto.ts
 *
 * @compliance
 * - Strict Segregation: Separate accountType field enforces trust vs operating separation
 * - IOLTA Participation: accountType=IOLTA designates IOLTA program accounts
 * - Individual Client Ledgers: clientId tracks per-client balances
 * - Zero Balance Principle: Negative balances prohibited via validation
 * - Audit Trail: Full audit fields track all changes
 */
export interface TrustAccount extends BaseEntity {
  // Identification
  accountNumber: string; // Unique account number
  accountName: string; // Display name - MUST include "Trust Account" or "Escrow Account"
  accountType: TrustAccountType; // IOLTA | CLIENT_TRUST | OPERATING

  // Client/Case Association (Individual Client Ledger Support)
  clientId: EntityId; // Associated client (UUID) - Required for client ledger tracking
  clientName: string; // Client display name
  caseId?: CaseId; // Optional associated case (UUID)

  // Financial (Zero Balance Principle)
  balance: number; // Current balance (decimal 15,2) - NEVER negative
  currency: string; // ISO 4217 code (default 'USD')
  minimumBalance?: number; // Required minimum balance (decimal 15,2)
  interestBearing: boolean; // Whether account earns interest (IOLTA typically yes)

  // Bank Details (Approved Institution)
  bankName?: string; // Financial institution name
  bankAccountNumber?: string; // Masked/full account number
  routingNumber?: string; // Bank routing number

  // COMPLIANCE: Account Setup and Structure
  stateBarApproved?: boolean; // Whether bank is approved by state bar for overdraft reporting
  jurisdiction?: string; // State where account is maintained (e.g., 'CA', 'NY')
  ioltalProgramId?: string; // State IOLTA program registration ID (if applicable)
  overdraftReportingEnabled?: boolean; // Whether bank reports overdrafts to state bar
  accountTitleCompliant?: boolean; // Whether account title includes "Trust" or "Escrow"
  clientConsentForLocation?: boolean; // Client written consent if account outside lawyer's state

  // COMPLIANCE: Recordkeeping and Documentation
  lastReconciledDate?: string; // ISO 8601 date of last three-way reconciliation
  reconciliationStatus?: ReconciliationStatus; // Current reconciliation status
  nextReconciliationDue?: string; // ISO 8601 date when next reconciliation is due (monthly)
  recordRetentionYears?: number; // Years to retain records (typically 5-7)
  checkNumberRangeStart?: number; // Starting pre-numbered check number
  checkNumberRangeCurrent?: number; // Current pre-numbered check number

  // COMPLIANCE: Signatory Control
  authorizedSignatories?: EntityId[]; // Array of attorney/staff UUIDs with signatory authority
  primarySignatory?: EntityId; // Primary responsible attorney (UUID)

  // Status & Dates
  status: TrustAccountStatus; // ACTIVE | INACTIVE | CLOSED | SUSPENDED
  openedDate?: string; // ISO 8601 date when opened
  closedDate?: string; // ISO 8601 date when closed

  // Metadata
  purpose?: string; // Account purpose/description
  notes?: string; // Additional notes - Include any special client instructions
  responsibleAttorney?: EntityId; // Attorney managing account (UUID)

  // Audit Fields (from BaseEntity + additional)
  version: number; // Optimistic locking version for concurrency control
  createdBy?: UserId; // User who created (UUID)
  updatedBy?: UserId; // User who last updated (UUID)
  deletedAt?: string; // Soft delete timestamp (ISO 8601)
}

/**
 * Trust Transaction Entity - Complete 1:1 mapping with backend
 * COMPLIANCE: Meets state bar requirements for trust transaction tracking
 *
 * @see backend/src/billing/trust-accounts/entities/trust-transaction.entity.ts
 *
 * @compliance
 * - Prompt Deposit: fundsReceivedDate vs transactionDate tracks deposit timing
 * - No Commingling: transactionSource identifies if funds are client vs firm
 * - Pre-numbered Checks: checkNumber required for CHECK payment method
 * - Prohibition of Cash: paymentMethod validation prevents CASH/ATM withdrawals
 * - Transaction Descriptions: description field required with source and purpose
 * - Zero Balance: balanceAfter validation ensures never negative
 * - Disputed Funds: disputedAmount and disputeReason track fee disputes
 */
export interface TrustTransactionEntity extends BaseEntity {
  // Account Association (Individual Client Ledger)
  trustAccountId: EntityId; // Parent trust account (UUID)
  caseId?: CaseId; // Associated case (UUID) - Links to specific matter
  clientId?: EntityId; // Associated client (UUID) - Required for client ledger tracking

  // Transaction Core
  transactionType: TransactionType; // DEPOSIT | WITHDRAWAL | TRANSFER | etc.
  transactionDate: string; // ISO 8601 date - When transaction occurred
  amount: number; // Transaction amount (decimal 15,2) - Always positive
  balanceAfter: number; // Balance after transaction (decimal 15,2) - NEVER negative
  description: string; // Transaction description (REQUIRED) - Must include source, client, purpose

  // COMPLIANCE: Deposit and Withdrawal Rules
  fundsReceivedDate?: string; // ISO 8601 timestamp - When funds were physically received
  promptDepositCompliant?: boolean; // Whether deposited within 24-48 hours of receipt
  isAdvancedFee?: boolean; // Whether this is an unearned retainer/advanced cost
  isEarnedFee?: boolean; // Whether this fee has been earned and can be withdrawn
  transactionSource?: "client" | "firm" | "third_party"; // Source of funds (prevents commingling)
  isOperatingFundTransfer?: boolean; // Flag if transferring from trust to operating (earned fee)

  // Status & Reference (Pre-numbered Checks)
  status: TransactionStatus; // PENDING | CLEARED | RECONCILED | CANCELLED | FAILED
  referenceNumber?: string; // External reference number
  checkNumber?: string; // Pre-numbered check number (REQUIRED for CHECK payment method)
  checkVoided?: boolean; // Whether check was voided (must track voided checks)

  // Payment Details (Cash Withdrawal Prohibition)
  payee?: string; // Recipient name (required for withdrawals)
  payor?: string; // Payer name (required for deposits)
  paymentMethod?: PaymentMethod | string; // CHECK, WIRE, ACH, EFT (NEVER CASH or ATM for withdrawals)
  paymentMethodCompliant?: boolean; // Validation flag for payment method compliance

  // Relationships
  relatedInvoiceId?: EntityId; // Associated invoice (UUID)
  relatedTransactionId?: EntityId; // Linked transaction for transfers (UUID)

  // COMPLIANCE: Approval and Authorization
  approvedBy?: UserId; // User who approved (UUID) - Required for withdrawals
  approvedAt?: string; // ISO 8601 timestamp
  signatoryAuthorized?: boolean; // Whether approver has signatory authority

  // COMPLIANCE: Three-Way Reconciliation
  reconciled: boolean; // Whether reconciled with bank statement
  reconciledDate?: string; // ISO 8601 date
  reconciledBy?: UserId; // User who reconciled (UUID)
  bankStatementDate?: string; // ISO 8601 date of bank statement showing this transaction
  clearedDate?: string; // ISO 8601 date when transaction cleared the bank

  // COMPLIANCE: Communication and Disputed Funds
  clientNotified?: boolean; // Whether client was notified promptly
  clientNotifiedDate?: string; // ISO 8601 timestamp of client notification
  disputedAmount?: number; // Amount in dispute (if any) - Must remain in trust
  disputeReason?: string; // Reason for dispute
  disputeResolvedDate?: string; // ISO 8601 date when dispute resolved

  // Attachments & Documentation (Recordkeeping)
  notes?: string; // Additional notes
  attachments?: string[]; // Array of file paths/URLs for supporting documents
  documentPath?: string; // Primary document path

  // Metadata
  metadata?: Record<string, unknown>; // JSON metadata for additional compliance data

  // Audit Trail (5-7 year retention)
  createdBy?: UserId; // User who created (UUID)
  updatedBy?: UserId; // User who last updated (UUID)
  retentionExpiryDate?: string; // ISO 8601 date when records can be destroyed (5-7 years)
}

/**
 * Create Trust Account DTO - Matches backend CreateTrustAccountDto
 * @see backend/src/billing/trust-accounts/dto/create-trust-account.dto.ts
 */
export interface CreateTrustAccountDto {
  // Required
  accountNumber: string;
  accountName: string;
  accountType: TrustAccountType;
  clientId: string;
  clientName: string;

  // Optional
  caseId?: string;
  balance?: number;
  currency?: string;
  status?: TrustAccountStatus;
  bankName?: string;
  bankAccountNumber?: string;
  routingNumber?: string;
  purpose?: string;
  openedDate?: string;
  minimumBalance?: number;
  interestBearing?: boolean;
  notes?: string;
  responsibleAttorney?: string;
}

/**
 * Update Trust Account DTO - Matches backend UpdateTrustAccountDto
 * @see backend/src/billing/trust-accounts/dto/update-trust-account.dto.ts
 */
export type UpdateTrustAccountDto = Partial<CreateTrustAccountDto>;

/**
 * Create Trust Transaction DTO - Matches backend CreateTransactionDto
 * @see backend/src/billing/trust-accounts/dto/trust-transaction.dto.ts
 */
export interface CreateTrustTransactionDto {
  transactionType: TransactionType;
  transactionDate: string; // ISO 8601 date
  amount: number; // Minimum 0.01
  description: string;
  referenceNumber?: string;
  checkNumber?: string;
  payee?: string;
  payor?: string;
  paymentMethod?: string;
  relatedInvoiceId?: string;
  relatedCaseId?: string;
  notes?: string;
  attachments?: string[];
}

/**
 * Deposit DTO - Matches backend DepositDto
 * @see backend/src/billing/trust-accounts/dto/trust-transaction.dto.ts
 */
export interface DepositDto {
  amount: number; // Minimum 0.01
  transactionDate: string; // ISO 8601 date
  description: string;
  payor?: string;
  referenceNumber?: string;
  paymentMethod?: string;
  notes?: string;
}

/**
 * Withdrawal DTO - Matches backend WithdrawalDto
 * @see backend/src/billing/trust-accounts/dto/trust-transaction.dto.ts
 */
export interface WithdrawalDto {
  amount: number; // Minimum 0.01
  transactionDate: string; // ISO 8601 date
  description: string;
  payee?: string;
  checkNumber?: string;
  relatedInvoiceId?: string;
  notes?: string;
}

/**
 * Trust Sub-Ledger - Client-specific trust balance tracking
 * Used for multiple clients sharing a single trust account
 */
export interface TrustSubLedger extends BaseEntity {
  name: string; // Client or matter name
  balance: Money; // Current balance for this sub-ledger
  lastReconciled: string; // ISO 8601 timestamp
  accountId?: EntityId; // Parent trust account ID
  clientId?: EntityId; // Associated client
  caseId?: CaseId; // Associated case
}

/**
 * Legacy TrustTransaction interface - DEPRECATED
 * @deprecated Use TrustTransactionEntity instead
 * Keeping for backward compatibility during migration
 */
export interface TrustTransaction {
  accountId: string;
  type: "Deposit" | "Withdrawal";
  amount: Money;
  date: string;
  checkNumber?: string;
  clearedDate?: string;
  description: string;
}

// Re-exports for convenience
export type {
  CreateTrustAccountDto as TrustAccountCreateInput,
  TrustAccount as TrustAccountEntity,
  UpdateTrustAccountDto as TrustAccountUpdateInput,
};

/**
 * Three-Way Reconciliation Report
 * COMPLIANCE: Monthly three-way reconciliation comparing:
 * 1. Bank statement balance
 * 2. Firm's main trust ledger balance
 * 3. Sum of all individual client ledgers
 *
 * @see State Bar Requirements - Monthly Reconciliation
 */
export interface ThreeWayReconciliation {
  // Reconciliation Identification
  accountId: EntityId;
  accountName: string;
  reconciliationDate: string; // ISO 8601 date
  reconciliationPeriod: string; // e.g., "December 2025"
  performedBy: UserId;
  performedAt: string; // ISO 8601 timestamp

  // Three Components
  bankStatementBalance: number; // (1) Bank statement ending balance
  trustLedgerBalance: number; // (2) Firm's main trust ledger balance
  clientLedgersTotal: number; // (3) Sum of all individual client sub-ledgers

  // Reconciliation Status
  isReconciled: boolean; // Whether all three match exactly
  discrepancyAmount?: number; // Difference if not reconciled (should be 0)
  discrepancyReason?: string; // Explanation of any discrepancy

  // Outstanding Items (Reconciliation Adjustments)
  outstandingDeposits: number; // Deposits in transit
  outstandingWithdrawals: number; // Outstanding checks not yet cleared
  bankAdjustments: number; // Bank fees, interest, etc.

  // Client Ledger Details (Individual Client Balances)
  clientLedgers: Array<{
    clientId: EntityId;
    clientName: string;
    caseId?: CaseId;
    balance: number;
    lastTransactionDate?: string;
  }>;

  // Compliance Checks
  negativeBalanceClients: string[]; // Client IDs with negative balances (VIOLATION)
  overdraftDetected: boolean; // Whether account went negative (VIOLATION)
  unmatchedTransactions: string[]; // Transaction IDs that don't match bank statement

  // Audit Trail
  notes?: string;
  attachments?: string[]; // Bank statements, reconciliation worksheets
  nextReconciliationDue: string; // ISO 8601 date (next month)
}

/**
 * Trust Account Compliance Audit Report
 * COMPLIANCE: Comprehensive audit report for state bar compliance
 * Checks all major compliance requirements
 */
export interface TrustAccountComplianceReport {
  // Report Metadata
  reportDate: string; // ISO 8601 timestamp
  reportPeriodStart: string; // ISO 8601 date
  reportPeriodEnd: string; // ISO 8601 date
  generatedBy: UserId;
  accountId: EntityId;
  accountName: string;

  // Account Setup Compliance
  accountSetupCompliance: {
    strictSegregation: boolean; // Separate from operating accounts
    accountTitleCompliant: boolean; // Titled "Trust Account" or "Escrow Account"
    stateBarApproved: boolean; // Bank approved by state bar
    ioltalParticipation: boolean; // Registered with IOLTA program (if applicable)
    jurisdictionCompliant: boolean; // In correct state or client consent obtained
  };

  // Deposit/Withdrawal Rules Compliance
  depositWithdrawalCompliance: {
    noCommingling: boolean; // No firm funds mixed with client funds
    promptDepositRate: number; // % of deposits made within 24-48 hours
    advancedFeesInTrust: boolean; // All unearned retainers in trust
    earnedFeesWithdrawn: boolean; // Earned fees removed promptly
    noCashWithdrawals: boolean; // No cash/ATM withdrawals detected
  };

  // Recordkeeping Compliance
  recordkeepingCompliance: {
    individualClientLedgers: boolean; // Separate ledger per client
    monthlyReconciliation: boolean; // Three-way reconciliation performed monthly
    transactionDescriptions: boolean; // All transactions have proper descriptions
    recordRetentionCurrent: boolean; // Records preserved per retention policy
    preNumberedChecks: boolean; // Using pre-numbered checks
  };

  // Communication Compliance
  communicationCompliance: {
    promptNotification: boolean; // Clients notified when funds received
    fullAccountingProvided: boolean; // Written accounting provided on request
    disputedFundsSegregated: boolean; // Disputed amounts kept in trust
    authorizedSignatories: boolean; // Only licensed attorneys signing
    zeroBalancePrinciple: boolean; // No negative client balances
  };

  // Violations Detected
  violations: Array<{
    violationType: string;
    severity: "critical" | "major" | "minor";
    description: string;
    transactionId?: EntityId;
    clientId?: EntityId;
    detectedDate: string;
    resolved: boolean;
    resolutionNotes?: string;
  }>;

  // Summary Statistics
  summary: {
    totalTransactions: number;
    totalDeposits: number;
    totalWithdrawals: number;
    averageBalanceAfter: number;
    numberOfClients: number;
    overdraftEvents: number;
    lateDeposits: number; // Deposits after 48 hours
    cashWithdrawals: number; // Should be 0
    unreconciledTransactions: number;
  };

  // Overall Compliance Score
  overallComplianceScore: number; // 0-100 percentage
  complianceStatus: "compliant" | "non_compliant" | "needs_review";
  recommendations: string[];
}

/**
 * Client Trust Ledger Statement
 * COMPLIANCE: Individual client ledger showing all transactions
 * Must be provided to client upon request or at case conclusion
 */
export interface ClientTrustLedgerStatement {
  // Client Information
  clientId: EntityId;
  clientName: string;
  caseId?: CaseId;
  caseName?: string;
  accountId: EntityId;
  accountNumber: string;

  // Statement Period
  statementDate: string; // ISO 8601 date
  periodStart: string; // ISO 8601 date
  periodEnd: string; // ISO 8601 date

  // Balances
  beginningBalance: number;
  endingBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;

  // Transactions (Chronological)
  transactions: Array<{
    transactionId: EntityId;
    date: string; // ISO 8601 date
    type: TransactionType;
    description: string;
    debit: number; // Withdrawals
    credit: number; // Deposits
    balance: number; // Running balance
    checkNumber?: string;
    referenceNumber?: string;
    status: TransactionStatus;
  }>;

  // Compliance Notes
  disputedAmount?: number;
  disputeStatus?: string;
  notes?: string;

  // Attestation
  preparedBy: UserId;
  preparedByName: string;
  preparedAt: string; // ISO 8601 timestamp
  attorneySignature?: string; // Digital signature or attestation
}

/**
 * Trust Account Validation Result
 * Real-time validation for compliance before transaction execution
 */
export interface TrustAccountValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}

/**
 * Three-Way Reconciliation DTO - Matches backend reconciliation endpoint
 * @see backend/src/billing/trust-accounts/trust-accounts.controller.ts
 */
export interface ThreeWayReconciliationDto {
  reconciliationDate: string; // ISO 8601 date
  bankStatementBalance: number; // Bank statement ending balance
  outstandingDeposits?: number; // Deposits in transit
  outstandingWithdrawals?: number; // Outstanding checks
  bankAdjustments?: number; // Bank fees, interest, etc.
  notes?: string;
}

/**
 * Trust Account Filters - Query parameters for filtering accounts
 */
export interface TrustAccountFilters {
  clientId?: string;
  status?: TrustAccountStatus;
  accountType?: TrustAccountType;
  jurisdiction?: string;
}

/**
 * Reconciliation Result - Three-way reconciliation outcome
 * Used for verifying bank balance = ledger balance = sum of client balances
 */
export interface ReconciliationResult {
  accountId: string;
  bankBalance: number;
  ledgerBalance: number;
  totalClientBalances: number;
  ledgerMatch: boolean;
  clientMatch: boolean;
  reconciled: boolean;
  reconciledAt: string;
  discrepancies: ReconciliationDiscrepancy[];
}

/**
 * Reconciliation Discrepancy - Details about reconciliation mismatches
 */
export interface ReconciliationDiscrepancy {
  type: "bank-ledger-mismatch" | "client-ledger-mismatch" | "calculation-error";
  amount: number;
  description: string;
}
