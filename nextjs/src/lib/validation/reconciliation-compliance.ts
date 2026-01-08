/**
 * Trust Account Reconciliation Compliance Validation
 *
 * Implements state bar compliance checks for trust account reconciliation:
 * - Three-way reconciliation validation (bank + ledger + client totals)
 * - Negative balance client detection (zero balance principle violations)
 * - Reconciliation overdue detection with severity levels
 * - Unmatched transaction identification
 * - Comprehensive compliance report generation
 *
 * @module lib/validation/reconciliation-compliance
 * @compliance State Bar Trust Account Rules
 */

// =============================================================================
// Types & Interfaces
// =============================================================================

/**
 * Client ledger entry for reconciliation
 */
export interface ClientLedgerEntry {
  clientId: string;
  clientName: string;
  caseId?: string;
  balance: number;
  lastTransactionDate?: string;
}

/**
 * Bank transaction record for matching
 */
export interface BankTransaction {
  transactionId: string;
  date: string;
  amount: number;
  type: 'credit' | 'debit';
  reference?: string;
  checkNumber?: string;
  description?: string;
  cleared: boolean;
}

/**
 * Ledger transaction record for matching
 */
export interface LedgerTransaction {
  transactionId: string;
  date: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'adjustment';
  reference?: string;
  checkNumber?: string;
  description?: string;
  reconciled: boolean;
  clientId?: string;
}

/**
 * Three-way reconciliation input data
 */
export interface ReconciliationData {
  accountId: string;
  accountName: string;
  reconciliationDate: string;
  bankStatementBalance: number;
  trustLedgerBalance: number;
  clientLedgers: ClientLedgerEntry[];
  bankTransactions: BankTransaction[];
  ledgerTransactions: LedgerTransaction[];
  outstandingDeposits?: number;
  outstandingWithdrawals?: number;
  bankAdjustments?: number;
  lastReconciliationDate?: string;
  reconciliationFrequency?: ReconciliationFrequency;
  performedBy?: string;
  notes?: string;
}

/**
 * Reconciliation frequency options
 */
export type ReconciliationFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly';

/**
 * Severity level for compliance issues
 */
export type ComplianceSeverity = 'critical' | 'error' | 'warning' | 'info';

/**
 * Three-way reconciliation validation result
 */
export interface ThreeWayReconciliationResult {
  isReconciled: boolean;
  bankStatementBalance: number;
  trustLedgerBalance: number;
  clientLedgersTotal: number;
  adjustedBankBalance: number;
  discrepancyAmount: number;
  discrepancyReason?: string;
  outstandingDeposits: number;
  outstandingWithdrawals: number;
  bankAdjustments: number;
  bankLedgerDifference: number;
  ledgerClientDifference: number;
  toleranceExceeded: boolean;
}

/**
 * Client with negative balance (compliance violation)
 */
export interface NegativeBalanceClient {
  clientId: string;
  clientName: string;
  caseId?: string;
  balance: number;
  lastTransactionDate?: string;
  severity: ComplianceSeverity;
  violationDescription: string;
}

/**
 * Reconciliation overdue result
 */
export interface ReconciliationOverdueResult {
  isOverdue: boolean;
  daysOverdue: number;
  severity: ComplianceSeverity;
  message: string;
  nextDueDate: string;
  lastReconciled?: string;
  requiresImmediateAction: boolean;
}

/**
 * Unmatched transaction result
 */
export interface UnmatchedTransaction {
  transactionId: string;
  source: 'bank' | 'ledger';
  date: string;
  amount: number;
  type: string;
  reference?: string;
  checkNumber?: string;
  description?: string;
  possibleMatches: string[];
  unmatchedReason: UnmatchedReason;
}

/**
 * Reason for transaction not matching
 */
export type UnmatchedReason =
  | 'no_match_found'
  | 'amount_mismatch'
  | 'date_mismatch'
  | 'duplicate_candidate'
  | 'timing_difference'
  | 'bank_error'
  | 'ledger_error';

/**
 * Compliance issue detected during reconciliation
 */
export interface ComplianceIssue {
  issueId: string;
  type: ComplianceIssueType;
  severity: ComplianceSeverity;
  title: string;
  description: string;
  affectedEntity?: string;
  affectedEntityType?: 'client' | 'transaction' | 'account';
  detectedAt: string;
  recommendation: string;
  regulatoryReference?: string;
}

/**
 * Types of compliance issues
 */
export type ComplianceIssueType =
  | 'negative_balance'
  | 'reconciliation_overdue'
  | 'unmatched_transaction'
  | 'discrepancy_detected'
  | 'overdraft_risk'
  | 'missing_documentation'
  | 'unauthorized_withdrawal'
  | 'commingling_risk';

/**
 * Comprehensive reconciliation compliance report
 */
export interface ReconciliationComplianceReport {
  // Report metadata
  reportId: string;
  generatedAt: string;
  generatedBy?: string;
  accountId: string;
  accountName: string;
  reconciliationDate: string;
  reconciliationPeriod: string;

  // Three-way reconciliation results
  threeWayReconciliation: ThreeWayReconciliationResult;

  // Client ledger analysis
  clientLedgers: ClientLedgerEntry[];
  clientLedgersTotal: number;
  clientCount: number;

  // Compliance violations
  negativeBalanceClients: NegativeBalanceClient[];
  overdraftDetected: boolean;

  // Transaction matching
  unmatchedTransactions: UnmatchedTransaction[];
  matchedTransactionCount: number;
  unmatchedTransactionCount: number;

  // Reconciliation status
  reconciliationOverdue: ReconciliationOverdueResult;
  nextReconciliationDue: string;

  // Overall compliance
  complianceIssues: ComplianceIssue[];
  complianceScore: number;
  complianceStatus: 'compliant' | 'non_compliant' | 'needs_review';

  // Summary statistics
  summary: {
    totalDeposits: number;
    totalWithdrawals: number;
    netChange: number;
    transactionCount: number;
    reconciledTransactionCount: number;
    pendingTransactionCount: number;
  };

  // Recommendations
  recommendations: string[];

  // Audit trail
  auditNotes?: string;
  attachments?: string[];
}

// =============================================================================
// Constants
// =============================================================================

/**
 * Compliance thresholds for reconciliation
 */
export const RECONCILIATION_THRESHOLDS = {
  /** Tolerance for floating point comparison (in cents) */
  BALANCE_TOLERANCE: 0.01,

  /** Days overdue before warning severity */
  WARNING_DAYS: 7,

  /** Days overdue before error severity */
  ERROR_DAYS: 14,

  /** Days overdue before critical severity */
  CRITICAL_DAYS: 30,

  /** Maximum days allowed for reconciliation by most state bars */
  MAX_RECONCILIATION_DAYS: 45,

  /** Date range tolerance for transaction matching (days) */
  DATE_MATCH_TOLERANCE_DAYS: 5,

  /** Amount tolerance for fuzzy matching (percentage) */
  AMOUNT_MATCH_TOLERANCE_PERCENT: 0,
} as const;

/**
 * Frequency configurations for reconciliation
 */
export const RECONCILIATION_FREQUENCIES: Record<ReconciliationFrequency, number> = {
  daily: 1,
  weekly: 7,
  monthly: 30,
  quarterly: 90,
} as const;

// =============================================================================
// Core Validation Functions
// =============================================================================

/**
 * Validates three-way reconciliation between bank statement, trust ledger, and client ledger totals.
 *
 * State bar rules require that these three amounts match exactly:
 * 1. Bank statement ending balance (adjusted for outstanding items)
 * 2. Firm's main trust ledger balance
 * 3. Sum of all individual client sub-ledgers
 *
 * @param bankStatementBalance - Bank statement ending balance
 * @param trustLedgerBalance - Firm's main trust ledger balance
 * @param clientLedgers - Array of individual client ledger entries
 * @param options - Optional adjustments for outstanding items
 * @returns Detailed reconciliation result with discrepancy analysis
 *
 * @example
 * ```typescript
 * const result = validateThreeWayReconciliation(
 *   50000.00,
 *   49500.00,
 *   [
 *     { clientId: '1', clientName: 'Client A', balance: 25000 },
 *     { clientId: '2', clientName: 'Client B', balance: 24500 },
 *   ],
 *   { outstandingDeposits: 500, outstandingWithdrawals: 0 }
 * );
 * ```
 */
export function validateThreeWayReconciliation(
  bankStatementBalance: number,
  trustLedgerBalance: number,
  clientLedgers: ClientLedgerEntry[],
  options: {
    outstandingDeposits?: number;
    outstandingWithdrawals?: number;
    bankAdjustments?: number;
  } = {}
): ThreeWayReconciliationResult {
  const {
    outstandingDeposits = 0,
    outstandingWithdrawals = 0,
    bankAdjustments = 0,
  } = options;

  // Calculate client ledgers total
  const clientLedgersTotal = clientLedgers.reduce(
    (sum, ledger) => sum + ledger.balance,
    0
  );

  // Calculate adjusted bank balance
  // Adjusted = Bank + Deposits in Transit - Outstanding Checks + Bank Adjustments
  const adjustedBankBalance =
    bankStatementBalance +
    outstandingDeposits -
    outstandingWithdrawals +
    bankAdjustments;

  // Calculate differences
  const bankLedgerDifference = Math.abs(adjustedBankBalance - trustLedgerBalance);
  const ledgerClientDifference = Math.abs(trustLedgerBalance - clientLedgersTotal);

  // Check if reconciled within tolerance
  const tolerance = RECONCILIATION_THRESHOLDS.BALANCE_TOLERANCE;
  const bankLedgerMatch = bankLedgerDifference <= tolerance;
  const ledgerClientMatch = ledgerClientDifference <= tolerance;
  const isReconciled = bankLedgerMatch && ledgerClientMatch;

  // Calculate total discrepancy
  const discrepancyAmount = Math.max(bankLedgerDifference, ledgerClientDifference);

  // Determine discrepancy reason
  let discrepancyReason: string | undefined;
  if (!isReconciled) {
    if (!bankLedgerMatch && !ledgerClientMatch) {
      discrepancyReason =
        'Both bank-to-ledger and ledger-to-client balances do not match';
    } else if (!bankLedgerMatch) {
      discrepancyReason = `Bank statement (adjusted) does not match trust ledger by $${bankLedgerDifference.toFixed(2)}`;
    } else if (!ledgerClientMatch) {
      discrepancyReason = `Trust ledger does not match client ledger total by $${ledgerClientDifference.toFixed(2)}`;
    }
  }

  return {
    isReconciled,
    bankStatementBalance,
    trustLedgerBalance,
    clientLedgersTotal,
    adjustedBankBalance,
    discrepancyAmount,
    discrepancyReason,
    outstandingDeposits,
    outstandingWithdrawals,
    bankAdjustments,
    bankLedgerDifference,
    ledgerClientDifference,
    toleranceExceeded: discrepancyAmount > tolerance,
  };
}

/**
 * Detects clients with negative balances, which is a compliance violation.
 *
 * The "zero balance principle" requires that no client's individual ledger
 * balance ever goes negative. A negative balance indicates that funds have
 * been disbursed that exceed the client's deposits - a serious violation.
 *
 * @param clientLedgers - Array of client ledger entries to check
 * @returns Array of clients with negative balances and violation details
 *
 * @example
 * ```typescript
 * const violations = detectNegativeBalanceClients([
 *   { clientId: '1', clientName: 'Client A', balance: 5000 },
 *   { clientId: '2', clientName: 'Client B', balance: -150 }, // VIOLATION
 * ]);
 * // Returns: [{ clientId: '2', balance: -150, severity: 'critical', ... }]
 * ```
 */
export function detectNegativeBalanceClients(
  clientLedgers: ClientLedgerEntry[]
): NegativeBalanceClient[] {
  const violations: NegativeBalanceClient[] = [];

  for (const ledger of clientLedgers) {
    if (ledger.balance < 0) {
      const absBalance = Math.abs(ledger.balance);

      // Determine severity based on amount
      let severity: ComplianceSeverity;
      if (absBalance >= 1000) {
        severity = 'critical';
      } else if (absBalance >= 100) {
        severity = 'error';
      } else {
        severity = 'warning';
      }

      violations.push({
        clientId: ledger.clientId,
        clientName: ledger.clientName,
        caseId: ledger.caseId,
        balance: ledger.balance,
        lastTransactionDate: ledger.lastTransactionDate,
        severity,
        violationDescription: `Client "${ledger.clientName}" has a negative trust balance of $${absBalance.toFixed(2)}. This violates the zero balance principle and may constitute misappropriation of client funds.`,
      });
    }
  }

  // Sort by severity (most severe first) then by absolute balance
  return violations.sort((a, b) => {
    const severityOrder: Record<ComplianceSeverity, number> = {
      critical: 0,
      error: 1,
      warning: 2,
      info: 3,
    };
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) return severityDiff;
    return Math.abs(b.balance) - Math.abs(a.balance);
  });
}

/**
 * Checks if reconciliation is overdue based on last reconciled date and frequency.
 *
 * State bar rules typically require monthly reconciliation of trust accounts.
 * This function calculates how overdue a reconciliation is and assigns
 * appropriate severity levels.
 *
 * @param lastReconciled - ISO date string of last reconciliation (or undefined if never)
 * @param frequency - Required reconciliation frequency (default: monthly)
 * @param referenceDate - Date to check against (default: current date)
 * @returns Overdue status with severity and recommendations
 *
 * @example
 * ```typescript
 * const status = checkReconciliationOverdue('2025-11-15', 'monthly');
 * // If today is 2026-01-08:
 * // Returns: { isOverdue: true, daysOverdue: 24, severity: 'error', ... }
 * ```
 */
export function checkReconciliationOverdue(
  lastReconciled: string | undefined,
  frequency: ReconciliationFrequency = 'monthly',
  referenceDate: Date = new Date()
): ReconciliationOverdueResult {
  const frequencyDays = RECONCILIATION_FREQUENCIES[frequency];

  // Calculate next due date
  let nextDueDate: Date;
  let lastReconciledDate: Date | undefined;

  if (lastReconciled) {
    lastReconciledDate = new Date(lastReconciled);
    nextDueDate = new Date(lastReconciledDate);
    nextDueDate.setDate(nextDueDate.getDate() + frequencyDays);
  } else {
    // If never reconciled, it's overdue from the beginning of the month
    nextDueDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
  }

  // Calculate days overdue
  const timeDiff = referenceDate.getTime() - nextDueDate.getTime();
  const daysOverdue = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const isOverdue = daysOverdue > 0;

  // Determine severity
  let severity: ComplianceSeverity;
  let requiresImmediateAction = false;

  if (daysOverdue >= RECONCILIATION_THRESHOLDS.CRITICAL_DAYS) {
    severity = 'critical';
    requiresImmediateAction = true;
  } else if (daysOverdue >= RECONCILIATION_THRESHOLDS.ERROR_DAYS) {
    severity = 'error';
    requiresImmediateAction = true;
  } else if (daysOverdue >= RECONCILIATION_THRESHOLDS.WARNING_DAYS) {
    severity = 'warning';
  } else if (isOverdue) {
    severity = 'info';
  } else {
    severity = 'info';
  }

  // Generate message
  let message: string;
  if (!lastReconciled) {
    message = 'Account has never been reconciled. Immediate reconciliation required.';
    severity = 'critical';
    requiresImmediateAction = true;
  } else if (isOverdue) {
    message = `Reconciliation is overdue by ${daysOverdue} day(s). Last reconciled on ${lastReconciledDate!.toISOString().split('T')[0]}.`;
  } else {
    const daysUntilDue = Math.abs(daysOverdue);
    message = `Reconciliation is current. Next reconciliation due in ${daysUntilDue} day(s).`;
  }

  return {
    isOverdue,
    daysOverdue: Math.max(0, daysOverdue),
    severity,
    message,
    nextDueDate: nextDueDate.toISOString().split('T')[0],
    lastReconciled,
    requiresImmediateAction,
  };
}

/**
 * Finds transactions that don't match between bank and ledger records.
 *
 * Matching is performed by comparing:
 * - Amount (must match exactly)
 * - Date (within tolerance window)
 * - Check number (if available)
 * - Reference number (if available)
 *
 * @param bankTransactions - Transactions from bank statement
 * @param ledgerTransactions - Transactions from trust ledger
 * @returns Array of unmatched transactions with possible match candidates
 *
 * @example
 * ```typescript
 * const unmatched = findUnmatchedTransactions(
 *   [{ transactionId: 'B1', amount: 1000, type: 'credit', date: '2025-01-01' }],
 *   [{ transactionId: 'L1', amount: 1000, type: 'deposit', date: '2025-01-02' }]
 * );
 * ```
 */
export function findUnmatchedTransactions(
  bankTransactions: BankTransaction[],
  ledgerTransactions: LedgerTransaction[]
): UnmatchedTransaction[] {
  const unmatched: UnmatchedTransaction[] = [];
  const matchedBankIds = new Set<string>();
  const matchedLedgerIds = new Set<string>();

  // Helper to check if dates are within tolerance
  const datesMatch = (date1: string, date2: string): boolean => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffDays = Math.abs(d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= RECONCILIATION_THRESHOLDS.DATE_MATCH_TOLERANCE_DAYS;
  };

  // Helper to check if amounts match
  const amountsMatch = (amount1: number, amount2: number): boolean => {
    return Math.abs(amount1 - amount2) <= RECONCILIATION_THRESHOLDS.BALANCE_TOLERANCE;
  };

  // Helper to normalize transaction type
  const normalizeType = (
    bankType: 'credit' | 'debit',
    ledgerType: 'deposit' | 'withdrawal' | 'transfer' | 'adjustment'
  ): boolean => {
    if (bankType === 'credit') {
      return ledgerType === 'deposit' || ledgerType === 'transfer';
    } else {
      return ledgerType === 'withdrawal' || ledgerType === 'transfer';
    }
  };

  // First pass: exact matches on check number
  for (const bankTxn of bankTransactions) {
    if (bankTxn.checkNumber) {
      const ledgerMatch = ledgerTransactions.find(
        (l) =>
          l.checkNumber === bankTxn.checkNumber &&
          amountsMatch(l.amount, bankTxn.amount) &&
          !matchedLedgerIds.has(l.transactionId)
      );

      if (ledgerMatch) {
        matchedBankIds.add(bankTxn.transactionId);
        matchedLedgerIds.add(ledgerMatch.transactionId);
      }
    }
  }

  // Second pass: match by reference number
  for (const bankTxn of bankTransactions) {
    if (matchedBankIds.has(bankTxn.transactionId)) continue;

    if (bankTxn.reference) {
      const ledgerMatch = ledgerTransactions.find(
        (l) =>
          l.reference === bankTxn.reference &&
          amountsMatch(l.amount, bankTxn.amount) &&
          !matchedLedgerIds.has(l.transactionId)
      );

      if (ledgerMatch) {
        matchedBankIds.add(bankTxn.transactionId);
        matchedLedgerIds.add(ledgerMatch.transactionId);
      }
    }
  }

  // Third pass: match by amount and date
  for (const bankTxn of bankTransactions) {
    if (matchedBankIds.has(bankTxn.transactionId)) continue;

    const ledgerMatch = ledgerTransactions.find(
      (l) =>
        amountsMatch(l.amount, bankTxn.amount) &&
        datesMatch(l.date, bankTxn.date) &&
        normalizeType(bankTxn.type, l.type) &&
        !matchedLedgerIds.has(l.transactionId)
    );

    if (ledgerMatch) {
      matchedBankIds.add(bankTxn.transactionId);
      matchedLedgerIds.add(ledgerMatch.transactionId);
    }
  }

  // Collect unmatched bank transactions
  for (const bankTxn of bankTransactions) {
    if (matchedBankIds.has(bankTxn.transactionId)) continue;

    // Find possible matches
    const possibleMatches: string[] = [];
    let unmatchedReason: UnmatchedReason = 'no_match_found';

    // Check for amount mismatches
    const sameCheckLedger = ledgerTransactions.find(
      (l) => l.checkNumber && l.checkNumber === bankTxn.checkNumber
    );
    if (sameCheckLedger && !amountsMatch(sameCheckLedger.amount, bankTxn.amount)) {
      possibleMatches.push(sameCheckLedger.transactionId);
      unmatchedReason = 'amount_mismatch';
    }

    // Check for date mismatches
    const sameAmountLedger = ledgerTransactions.find(
      (l) =>
        amountsMatch(l.amount, bankTxn.amount) && !matchedLedgerIds.has(l.transactionId)
    );
    if (sameAmountLedger && !datesMatch(sameAmountLedger.date, bankTxn.date)) {
      if (!possibleMatches.includes(sameAmountLedger.transactionId)) {
        possibleMatches.push(sameAmountLedger.transactionId);
      }
      if (unmatchedReason === 'no_match_found') {
        unmatchedReason = 'timing_difference';
      }
    }

    // Check if transaction is just not cleared yet
    if (!bankTxn.cleared && possibleMatches.length === 0) {
      unmatchedReason = 'timing_difference';
    }

    unmatched.push({
      transactionId: bankTxn.transactionId,
      source: 'bank',
      date: bankTxn.date,
      amount: bankTxn.amount,
      type: bankTxn.type,
      reference: bankTxn.reference,
      checkNumber: bankTxn.checkNumber,
      description: bankTxn.description,
      possibleMatches,
      unmatchedReason,
    });
  }

  // Collect unmatched ledger transactions
  for (const ledgerTxn of ledgerTransactions) {
    if (matchedLedgerIds.has(ledgerTxn.transactionId)) continue;

    const possibleMatches: string[] = [];
    let unmatchedReason: UnmatchedReason = 'no_match_found';

    // Check if not reconciled yet (expected for recent transactions)
    if (!ledgerTxn.reconciled) {
      unmatchedReason = 'timing_difference';
    }

    // Check for similar bank transactions
    const similarBank = bankTransactions.find(
      (b) =>
        amountsMatch(b.amount, ledgerTxn.amount) &&
        !matchedBankIds.has(b.transactionId)
    );
    if (similarBank) {
      possibleMatches.push(similarBank.transactionId);
      if (!datesMatch(similarBank.date, ledgerTxn.date)) {
        unmatchedReason = 'date_mismatch';
      }
    }

    unmatched.push({
      transactionId: ledgerTxn.transactionId,
      source: 'ledger',
      date: ledgerTxn.date,
      amount: ledgerTxn.amount,
      type: ledgerTxn.type,
      reference: ledgerTxn.reference,
      checkNumber: ledgerTxn.checkNumber,
      description: ledgerTxn.description,
      possibleMatches,
      unmatchedReason,
    });
  }

  return unmatched;
}

/**
 * Generates a comprehensive reconciliation compliance report.
 *
 * This function orchestrates all compliance checks and produces a
 * detailed report suitable for state bar audits and internal review.
 *
 * @param data - Complete reconciliation data including all transactions
 * @returns Comprehensive compliance report with score and recommendations
 *
 * @example
 * ```typescript
 * const report = generateReconciliationReport({
 *   accountId: 'ACC001',
 *   accountName: 'Main IOLTA Trust Account',
 *   reconciliationDate: '2026-01-08',
 *   bankStatementBalance: 100000,
 *   trustLedgerBalance: 100000,
 *   clientLedgers: [...],
 *   bankTransactions: [...],
 *   ledgerTransactions: [...],
 * });
 * ```
 */
export function generateReconciliationReport(
  data: ReconciliationData
): ReconciliationComplianceReport {
  const {
    accountId,
    accountName,
    reconciliationDate,
    bankStatementBalance,
    trustLedgerBalance,
    clientLedgers,
    bankTransactions,
    ledgerTransactions,
    outstandingDeposits = 0,
    outstandingWithdrawals = 0,
    bankAdjustments = 0,
    lastReconciliationDate,
    reconciliationFrequency = 'monthly',
    performedBy,
    notes,
  } = data;

  // Generate report ID
  const reportId = `REC-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const generatedAt = new Date().toISOString();

  // Determine reconciliation period
  const reconciliationPeriodDate = new Date(reconciliationDate);
  const reconciliationPeriod = reconciliationPeriodDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Run three-way reconciliation
  const threeWayReconciliation = validateThreeWayReconciliation(
    bankStatementBalance,
    trustLedgerBalance,
    clientLedgers,
    { outstandingDeposits, outstandingWithdrawals, bankAdjustments }
  );

  // Detect negative balance clients
  const negativeBalanceClients = detectNegativeBalanceClients(clientLedgers);
  const overdraftDetected = negativeBalanceClients.length > 0;

  // Find unmatched transactions
  const unmatchedTransactions = findUnmatchedTransactions(
    bankTransactions,
    ledgerTransactions
  );

  // Check reconciliation overdue status
  const reconciliationOverdue = checkReconciliationOverdue(
    lastReconciliationDate,
    reconciliationFrequency
  );

  // Calculate next reconciliation due
  const nextReconciliationDue = calculateNextReconciliationDue(
    reconciliationDate,
    reconciliationFrequency
  );

  // Calculate summary statistics
  const depositTransactions = ledgerTransactions.filter((t) => t.type === 'deposit');
  const withdrawalTransactions = ledgerTransactions.filter((t) => t.type === 'withdrawal');
  const totalDeposits = depositTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalWithdrawals = withdrawalTransactions.reduce((sum, t) => sum + t.amount, 0);
  const reconciledTransactions = ledgerTransactions.filter((t) => t.reconciled);
  const pendingTransactions = ledgerTransactions.filter((t) => !t.reconciled);

  const summary = {
    totalDeposits,
    totalWithdrawals,
    netChange: totalDeposits - totalWithdrawals,
    transactionCount: ledgerTransactions.length,
    reconciledTransactionCount: reconciledTransactions.length,
    pendingTransactionCount: pendingTransactions.length,
  };

  // Compile compliance issues
  const complianceIssues: ComplianceIssue[] = [];

  // Add negative balance issues
  for (const violation of negativeBalanceClients) {
    complianceIssues.push({
      issueId: `NB-${violation.clientId}`,
      type: 'negative_balance',
      severity: violation.severity,
      title: 'Negative Client Balance Detected',
      description: violation.violationDescription,
      affectedEntity: violation.clientId,
      affectedEntityType: 'client',
      detectedAt: generatedAt,
      recommendation:
        'Immediately investigate and correct the negative balance. This may require depositing funds or reversing erroneous transactions.',
      regulatoryReference: 'State Bar Rule - Zero Balance Principle',
    });
  }

  // Add reconciliation overdue issue
  if (reconciliationOverdue.isOverdue) {
    complianceIssues.push({
      issueId: `RO-${accountId}`,
      type: 'reconciliation_overdue',
      severity: reconciliationOverdue.severity,
      title: 'Reconciliation Overdue',
      description: reconciliationOverdue.message,
      affectedEntity: accountId,
      affectedEntityType: 'account',
      detectedAt: generatedAt,
      recommendation:
        'Complete reconciliation immediately. State bar rules require monthly reconciliation of trust accounts.',
      regulatoryReference: 'State Bar Rule - Monthly Reconciliation Requirement',
    });
  }

  // Add discrepancy issue
  if (!threeWayReconciliation.isReconciled) {
    complianceIssues.push({
      issueId: `DISC-${accountId}`,
      type: 'discrepancy_detected',
      severity: threeWayReconciliation.discrepancyAmount >= 100 ? 'error' : 'warning',
      title: 'Three-Way Reconciliation Discrepancy',
      description:
        threeWayReconciliation.discrepancyReason ||
        `Discrepancy of $${threeWayReconciliation.discrepancyAmount.toFixed(2)} detected`,
      affectedEntity: accountId,
      affectedEntityType: 'account',
      detectedAt: generatedAt,
      recommendation:
        'Investigate the source of the discrepancy. Review all outstanding items, bank adjustments, and transaction entries.',
      regulatoryReference: 'State Bar Rule - Three-Way Reconciliation',
    });
  }

  // Add unmatched transaction issues (only if significant)
  const significantUnmatched = unmatchedTransactions.filter((t) => t.amount >= 100);
  for (const unmatched of significantUnmatched.slice(0, 10)) {
    // Limit to 10 issues
    complianceIssues.push({
      issueId: `UT-${unmatched.transactionId}`,
      type: 'unmatched_transaction',
      severity: 'warning',
      title: 'Unmatched Transaction',
      description: `${unmatched.source === 'bank' ? 'Bank' : 'Ledger'} transaction of $${unmatched.amount.toFixed(2)} on ${unmatched.date} could not be matched. Reason: ${formatUnmatchedReason(unmatched.unmatchedReason)}`,
      affectedEntity: unmatched.transactionId,
      affectedEntityType: 'transaction',
      detectedAt: generatedAt,
      recommendation:
        'Review the transaction and locate the corresponding entry. May indicate timing differences or recording errors.',
    });
  }

  // Calculate compliance score (0-100)
  const complianceScore = calculateComplianceScore(
    threeWayReconciliation,
    negativeBalanceClients,
    unmatchedTransactions,
    reconciliationOverdue
  );

  // Determine overall compliance status
  let complianceStatus: 'compliant' | 'non_compliant' | 'needs_review';
  if (complianceScore >= 95 && negativeBalanceClients.length === 0) {
    complianceStatus = 'compliant';
  } else if (
    complianceScore < 70 ||
    negativeBalanceClients.some((c) => c.severity === 'critical')
  ) {
    complianceStatus = 'non_compliant';
  } else {
    complianceStatus = 'needs_review';
  }

  // Generate recommendations
  const recommendations = generateRecommendations(
    threeWayReconciliation,
    negativeBalanceClients,
    unmatchedTransactions,
    reconciliationOverdue
  );

  return {
    reportId,
    generatedAt,
    generatedBy: performedBy,
    accountId,
    accountName,
    reconciliationDate,
    reconciliationPeriod,
    threeWayReconciliation,
    clientLedgers,
    clientLedgersTotal: threeWayReconciliation.clientLedgersTotal,
    clientCount: clientLedgers.length,
    negativeBalanceClients,
    overdraftDetected,
    unmatchedTransactions,
    matchedTransactionCount:
      bankTransactions.length +
      ledgerTransactions.length -
      unmatchedTransactions.length,
    unmatchedTransactionCount: unmatchedTransactions.length,
    reconciliationOverdue,
    nextReconciliationDue,
    complianceIssues,
    complianceScore,
    complianceStatus,
    summary,
    recommendations,
    auditNotes: notes,
  };
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Calculates the next reconciliation due date based on current date and frequency
 */
function calculateNextReconciliationDue(
  currentReconciliationDate: string,
  frequency: ReconciliationFrequency
): string {
  const date = new Date(currentReconciliationDate);
  const frequencyDays = RECONCILIATION_FREQUENCIES[frequency];
  date.setDate(date.getDate() + frequencyDays);
  return date.toISOString().split('T')[0];
}

/**
 * Formats an unmatched reason into a human-readable string
 */
function formatUnmatchedReason(reason: UnmatchedReason): string {
  const reasonMap: Record<UnmatchedReason, string> = {
    no_match_found: 'No matching transaction found',
    amount_mismatch: 'Amount does not match',
    date_mismatch: 'Date outside expected range',
    duplicate_candidate: 'Multiple potential matches exist',
    timing_difference: 'Transaction timing difference (may clear later)',
    bank_error: 'Suspected bank statement error',
    ledger_error: 'Suspected ledger recording error',
  };
  return reasonMap[reason] || reason;
}

/**
 * Calculates the overall compliance score based on all factors
 */
function calculateComplianceScore(
  threeWay: ThreeWayReconciliationResult,
  negativeBalances: NegativeBalanceClient[],
  unmatchedTxns: UnmatchedTransaction[],
  overdueStatus: ReconciliationOverdueResult
): number {
  let score = 100;

  // Deduct for three-way reconciliation discrepancy
  if (!threeWay.isReconciled) {
    if (threeWay.discrepancyAmount >= 1000) {
      score -= 30;
    } else if (threeWay.discrepancyAmount >= 100) {
      score -= 20;
    } else {
      score -= 10;
    }
  }

  // Deduct for negative balances (critical violation)
  for (const negBalance of negativeBalances) {
    if (negBalance.severity === 'critical') {
      score -= 25;
    } else if (negBalance.severity === 'error') {
      score -= 15;
    } else {
      score -= 5;
    }
  }

  // Deduct for unmatched transactions
  const significantUnmatched = unmatchedTxns.filter((t) => t.amount >= 100);
  score -= Math.min(significantUnmatched.length * 2, 20);

  // Deduct for overdue reconciliation
  if (overdueStatus.isOverdue) {
    if (overdueStatus.severity === 'critical') {
      score -= 25;
    } else if (overdueStatus.severity === 'error') {
      score -= 15;
    } else if (overdueStatus.severity === 'warning') {
      score -= 5;
    }
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Generates actionable recommendations based on compliance issues
 */
function generateRecommendations(
  threeWay: ThreeWayReconciliationResult,
  negativeBalances: NegativeBalanceClient[],
  unmatchedTxns: UnmatchedTransaction[],
  overdueStatus: ReconciliationOverdueResult
): string[] {
  const recommendations: string[] = [];

  // Critical: Negative balance recommendations
  if (negativeBalances.length > 0) {
    recommendations.push(
      'URGENT: Immediately investigate and resolve all negative client balances. This is a serious compliance violation that may require notification to the state bar.'
    );
    recommendations.push(
      'Review recent disbursements to identify the cause of negative balances. Consider whether any transactions need to be reversed.'
    );
  }

  // Overdue reconciliation recommendations
  if (overdueStatus.isOverdue) {
    if (overdueStatus.severity === 'critical') {
      recommendations.push(
        'URGENT: Complete trust account reconciliation immediately. The account is significantly overdue for required monthly reconciliation.'
      );
    } else {
      recommendations.push(
        'Schedule time to complete the trust account reconciliation as soon as possible to maintain compliance.'
      );
    }
  }

  // Discrepancy recommendations
  if (!threeWay.isReconciled) {
    recommendations.push(
      `Investigate the reconciliation discrepancy of $${threeWay.discrepancyAmount.toFixed(2)}. Review all outstanding deposits and withdrawals.`
    );

    if (threeWay.bankLedgerDifference > 0) {
      recommendations.push(
        'The bank-to-ledger difference may indicate missed transactions or timing issues. Cross-reference bank statement entries with ledger transactions.'
      );
    }

    if (threeWay.ledgerClientDifference > 0) {
      recommendations.push(
        'The ledger-to-client difference suggests individual client ledgers may need adjustment. Verify all client sub-ledger balances sum to the main ledger total.'
      );
    }
  }

  // Unmatched transaction recommendations
  if (unmatchedTxns.length > 0) {
    const bankUnmatched = unmatchedTxns.filter((t) => t.source === 'bank').length;
    const ledgerUnmatched = unmatchedTxns.filter((t) => t.source === 'ledger').length;

    if (bankUnmatched > 0) {
      recommendations.push(
        `Review ${bankUnmatched} bank statement transaction(s) that could not be matched to ledger entries.`
      );
    }

    if (ledgerUnmatched > 0) {
      recommendations.push(
        `Review ${ledgerUnmatched} ledger transaction(s) that could not be matched to bank statement entries. These may represent checks or deposits still in transit.`
      );
    }
  }

  // General best practice recommendations
  if (recommendations.length === 0) {
    recommendations.push(
      'Trust account is in good standing. Continue with monthly reconciliations and maintain detailed records.'
    );
  }

  recommendations.push(
    'Retain this reconciliation report and all supporting documentation for at least 5-7 years per state bar record retention requirements.'
  );

  return recommendations;
}

// =============================================================================
// Integration Helpers
// =============================================================================

/**
 * Validates reconciliation input data before processing.
 * Use this to validate data from form submissions or API calls.
 *
 * @param data - Partial reconciliation data to validate
 * @returns Validation result with any errors
 */
export function validateReconciliationInput(
  data: Partial<ReconciliationData>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.accountId) {
    errors.push('Account ID is required');
  }

  if (!data.reconciliationDate) {
    errors.push('Reconciliation date is required');
  } else {
    const date = new Date(data.reconciliationDate);
    if (isNaN(date.getTime())) {
      errors.push('Reconciliation date is invalid');
    }
  }

  if (typeof data.bankStatementBalance !== 'number') {
    errors.push('Bank statement balance is required');
  } else if (data.bankStatementBalance < 0) {
    errors.push('Bank statement balance cannot be negative');
  }

  if (typeof data.trustLedgerBalance !== 'number') {
    errors.push('Trust ledger balance is required');
  }

  if (!data.clientLedgers || !Array.isArray(data.clientLedgers)) {
    errors.push('Client ledgers array is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Converts a ReconciliationComplianceReport to a format suitable for storage or API response.
 *
 * @param report - The full compliance report
 * @returns Simplified report suitable for storage
 */
export function serializeReconciliationReport(
  report: ReconciliationComplianceReport
): Record<string, unknown> {
  return {
    reportId: report.reportId,
    generatedAt: report.generatedAt,
    generatedBy: report.generatedBy,
    accountId: report.accountId,
    accountName: report.accountName,
    reconciliationDate: report.reconciliationDate,
    reconciliationPeriod: report.reconciliationPeriod,
    isReconciled: report.threeWayReconciliation.isReconciled,
    discrepancyAmount: report.threeWayReconciliation.discrepancyAmount,
    negativeBalanceCount: report.negativeBalanceClients.length,
    unmatchedTransactionCount: report.unmatchedTransactionCount,
    complianceScore: report.complianceScore,
    complianceStatus: report.complianceStatus,
    issueCount: report.complianceIssues.length,
    criticalIssueCount: report.complianceIssues.filter((i) => i.severity === 'critical')
      .length,
    nextReconciliationDue: report.nextReconciliationDue,
    summary: report.summary,
  };
}
