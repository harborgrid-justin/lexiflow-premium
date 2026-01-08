'use server';

/**
 * Trust Ledger Server Actions
 *
 * Server-side actions for IOLTA trust account management following Next.js 16 conventions.
 * Implements prompt deposit compliance (24-48 hour rule), cash withdrawal prohibition,
 * three-way reconciliation, and comprehensive compliance reporting.
 *
 * @module trust-ledger/actions
 * @see State Bar Trust Account Rules for compliance requirements
 */

import { revalidateTag } from 'next/cache';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import type {
  TrustTransactionEntity,
  TrustAccountComplianceReport,
  ClientTrustLedgerStatement,
  ThreeWayReconciliationDto,
  TrustAccount,
  PaymentMethod,
} from '@/types/trust-accounts';

// Import centralized trust compliance validation utilities
import {
  validateAccountTitle,
  validatePaymentMethod,
  validatePromptDeposit,
  validateZeroBalance,
  identifyComplianceIssues,
  checkPromptDepositCompliance,
  checkCashWithdrawalProhibition,
  validateCheckNumber,
  validateDeposit,
  validateWithdrawal,
  calculateHoursBetween,
  COMPLIANCE_THRESHOLDS,
  type ComplianceIssue,
  type PromptDepositCheckResult,
  type PaymentMethodCheckResult,
  type ZeroBalanceCheckResult,
} from '@/lib/validation/trust-compliance';

// =============================================================================
// Type Definitions
// =============================================================================

/**
 * Server action result type with generic data payload
 */
export interface ActionResult<T = unknown> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
  complianceWarnings?: string[];
}

/**
 * Deposit input for trust account deposits
 * Validates prompt deposit compliance (24-48 hour rule)
 */
export interface DepositFundsInput {
  amount: number;
  transactionDate: string;
  description: string;
  payor: string;
  payorType?: 'client' | 'third_party';
  referenceNumber?: string;
  checkNumber?: string;
  paymentMethod?: string;
  fundsReceivedDate?: string; // Required for prompt deposit compliance check
  clientId?: string;
  caseId?: string;
  notes?: string;
}

/**
 * Withdrawal input for trust account withdrawals
 * Enforces cash prohibition and zero balance principle
 */
export interface WithdrawFundsInput {
  amount: number;
  transactionDate: string;
  description: string;
  payee: string;
  checkNumber?: string; // Required for CHECK payment method
  paymentMethod: Exclude<PaymentMethod, 'cash' | 'atm'> | string; // CASH and ATM prohibited
  purpose: 'payment_to_client' | 'payment_to_vendor' | 'fee_transfer' | 'refund' | 'other';
  relatedInvoiceId?: string;
  clientId?: string;
  caseId?: string;
  notes?: string;
}

/**
 * Reconciliation input for three-way reconciliation
 * Matches: bank statement + main ledger + client ledgers
 */
export interface ReconcileAccountInput {
  reconciliationDate: string;
  bankStatementBalance: number;
  bankStatementDate?: string;
  outstandingDeposits?: number;
  outstandingWithdrawals?: number;
  outstandingChecks?: Array<{ checkNumber: string; amount: number; date?: string }>;
  depositsInTransit?: Array<{ reference: string; amount: number; date?: string }>;
  bankAdjustments?: number;
  notes?: string;
}

/**
 * Compliance report request parameters
 */
export interface ComplianceReportParams {
  periodStart: string;
  periodEnd: string;
}

/**
 * Client ledger request parameters
 */
export interface ClientLedgerParams {
  clientId: string;
  periodStart: string;
  periodEnd: string;
}

/**
 * Trust ledger summary with calculated balances
 */
export interface TrustLedgerSummary {
  currentBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  lastReconciliation: string;
  unreconciledCount: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
}

// =============================================================================
// Cache Tags
// =============================================================================

const CACHE_TAGS = {
  TRUST_LEDGER: 'trust-ledger',
  TRUST_TRANSACTIONS: 'trust-ledger-transactions',
  TRUST_SUMMARY: 'trust-ledger-summary',
  TRUST_ACCOUNT_DETAIL: (id: string) => `trust-account-${id}`,
  TRUST_COMPLIANCE: (id: string) => `trust-compliance-${id}`,
  TRUST_CLIENT_LEDGER: (accountId: string, clientId: string) =>
    `trust-client-ledger-${accountId}-${clientId}`,
} as const;

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Safely revalidate a cache tag
 */
function safeRevalidateTag(tag: string): void {
  try {
    revalidateTag(tag);
  } catch {
    console.warn(`Failed to revalidate tag: ${tag}`);
  }
}

// Re-export validation utilities for use by other modules
export {
  validateAccountTitle,
  validatePaymentMethod,
  validatePromptDeposit,
  validateZeroBalance,
  identifyComplianceIssues,
  validateDeposit,
  validateWithdrawal,
  type ComplianceIssue,
};

// =============================================================================
// Balance Calculation Utilities
// =============================================================================

/**
 * Calculate total balance across all trust accounts
 * @param accounts - Array of trust accounts
 * @returns Total balance sum
 */
export function calculateTotalBalance(accounts: TrustAccount[]): number {
  return accounts.reduce((sum, account) => sum + (account.balance || 0), 0);
}

/**
 * Calculate total deposits from transactions
 * @param transactions - Array of trust transactions
 * @returns Total deposits sum
 */
export function calculateTotalDeposits(transactions: TrustTransactionEntity[]): number {
  return transactions
    .filter((tx) => tx.transactionType === 'deposit')
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);
}

/**
 * Calculate total withdrawals from transactions
 * @param transactions - Array of trust transactions
 * @returns Total withdrawals sum
 */
export function calculateTotalWithdrawals(transactions: TrustTransactionEntity[]): number {
  return transactions
    .filter((tx) => tx.transactionType === 'withdrawal')
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);
}

/**
 * Calculate running balance for transactions
 * Adds balanceAfter to each transaction in chronological order
 * @param transactions - Array of trust transactions (should be sorted by date)
 * @param startingBalance - Starting balance before first transaction
 * @returns Transactions with calculated running balance
 */
export function calculateRunningBalance(
  transactions: TrustTransactionEntity[],
  startingBalance: number = 0
): TrustTransactionEntity[] {
  let runningBalance = startingBalance;

  return transactions.map((tx) => {
    if (tx.transactionType === 'deposit') {
      runningBalance += tx.amount;
    } else if (tx.transactionType === 'withdrawal') {
      runningBalance -= tx.amount;
    }

    return {
      ...tx,
      balanceAfter: runningBalance,
    };
  });
}

/**
 * Calculate pending transactions summary
 * @param transactions - Array of trust transactions
 * @returns Object with pending deposit and withdrawal totals
 */
export function calculatePendingTransactions(transactions: TrustTransactionEntity[]): {
  pendingDeposits: number;
  pendingWithdrawals: number;
} {
  const pendingTransactions = transactions.filter((tx) => tx.status === 'pending');

  return {
    pendingDeposits: pendingTransactions
      .filter((tx) => tx.transactionType === 'deposit')
      .reduce((sum, tx) => sum + tx.amount, 0),
    pendingWithdrawals: pendingTransactions
      .filter((tx) => tx.transactionType === 'withdrawal')
      .reduce((sum, tx) => sum + tx.amount, 0),
  };
}

// =============================================================================
// Server Actions
// =============================================================================

/**
 * Deposit funds into trust account
 * Validates prompt deposit compliance (24-48 hour rule)
 *
 * @param accountId - Trust account UUID
 * @param input - Deposit details including amount, payor, and dates
 * @returns Action result with transaction data and compliance warnings
 *
 * @compliance
 * - Prompt Deposit: Validates funds are deposited within 24-48 hours of receipt
 * - Transaction Description: Requires proper description with source and purpose
 * - Funds Source Tracking: Tracks whether funds are from client or third party
 */
export async function depositFunds(
  accountId: string,
  input: DepositFundsInput
): Promise<ActionResult<TrustTransactionEntity>> {
  try {
    // Validate required fields
    if (!accountId) {
      return { success: false, error: 'Account ID is required' };
    }

    if (!input.amount || input.amount <= 0) {
      return { success: false, error: 'Deposit amount must be greater than zero' };
    }

    if (!input.description?.trim()) {
      return { success: false, error: 'Transaction description is required for compliance' };
    }

    if (!input.payor?.trim()) {
      return { success: false, error: 'Payor name is required' };
    }

    // Check prompt deposit compliance
    const complianceWarnings: string[] = [];
    const promptDepositCheck = checkPromptDepositCompliance(
      input.fundsReceivedDate,
      input.transactionDate
    );

    if (!promptDepositCheck.compliant) {
      // Log violation but allow deposit with warning
      complianceWarnings.push(promptDepositCheck.violation!);
      console.warn(`Prompt deposit violation for account ${accountId}:`, promptDepositCheck.violation);
    } else if (promptDepositCheck.warning) {
      complianceWarnings.push(promptDepositCheck.warning);
    }

    // Build deposit payload
    const depositPayload = {
      amount: input.amount,
      transactionDate: input.transactionDate,
      description: input.description,
      payor: input.payor,
      referenceNumber: input.referenceNumber,
      checkNumber: input.checkNumber,
      paymentMethod: input.paymentMethod,
      fundsReceivedDate: input.fundsReceivedDate,
      transactionSource: input.payorType || 'client',
      promptDepositCompliant: promptDepositCheck.compliant,
      clientId: input.clientId,
      caseId: input.caseId,
      notes: input.notes,
    };

    // Execute deposit API call
    const transaction = await apiFetch<TrustTransactionEntity>(
      `${API_ENDPOINTS.TRUST_LEDGER.DEPOSIT}`,
      {
        method: 'POST',
        body: JSON.stringify({ accountId, ...depositPayload }),
      }
    );

    // Revalidate cache tags
    safeRevalidateTag(CACHE_TAGS.TRUST_LEDGER);
    safeRevalidateTag(CACHE_TAGS.TRUST_TRANSACTIONS);
    safeRevalidateTag(CACHE_TAGS.TRUST_SUMMARY);
    safeRevalidateTag(CACHE_TAGS.TRUST_ACCOUNT_DETAIL(accountId));

    return {
      success: true,
      message: 'Deposit recorded successfully',
      data: transaction,
      complianceWarnings: complianceWarnings.length > 0 ? complianceWarnings : undefined,
    };
  } catch (error) {
    console.error('Failed to deposit funds:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to record deposit',
    };
  }
}

/**
 * Withdraw funds from trust account
 * Enforces cash prohibition and zero balance principle
 *
 * @param accountId - Trust account UUID
 * @param input - Withdrawal details including amount, payee, and payment method
 * @returns Action result with transaction data
 *
 * @compliance
 * - Cash Prohibition: Rejects CASH and ATM payment methods
 * - Pre-numbered Checks: Requires check number for CHECK payment method
 * - Zero Balance Principle: Backend validates account won't go negative
 * - Authorized Signatory: Backend validates user has signatory authority
 */
export async function withdrawFunds(
  accountId: string,
  input: WithdrawFundsInput
): Promise<ActionResult<TrustTransactionEntity>> {
  try {
    // Validate required fields
    if (!accountId) {
      return { success: false, error: 'Account ID is required' };
    }

    if (!input.amount || input.amount <= 0) {
      return { success: false, error: 'Withdrawal amount must be greater than zero' };
    }

    if (!input.description?.trim()) {
      return { success: false, error: 'Transaction description is required for compliance' };
    }

    if (!input.payee?.trim()) {
      return { success: false, error: 'Payee name is required' };
    }

    if (!input.paymentMethod) {
      return { success: false, error: 'Payment method is required' };
    }

    // Check cash withdrawal prohibition
    const cashCheck = checkCashWithdrawalProhibition(input.paymentMethod);
    if (!cashCheck.compliant) {
      return {
        success: false,
        error: cashCheck.violation,
      };
    }

    // Validate check number for CHECK payment method
    const checkValidation = validateCheckNumber(input.paymentMethod, input.checkNumber);
    if (!checkValidation.valid) {
      return {
        success: false,
        error: checkValidation.error,
      };
    }

    // Build withdrawal payload
    const withdrawalPayload = {
      amount: input.amount,
      transactionDate: input.transactionDate,
      description: input.description,
      payee: input.payee,
      checkNumber: input.checkNumber,
      paymentMethod: input.paymentMethod,
      purpose: input.purpose,
      relatedInvoiceId: input.relatedInvoiceId,
      clientId: input.clientId,
      caseId: input.caseId,
      notes: input.notes,
      paymentMethodCompliant: true, // Validated above
    };

    // Execute withdrawal API call
    const transaction = await apiFetch<TrustTransactionEntity>(
      `${API_ENDPOINTS.TRUST_LEDGER.WITHDRAWAL}`,
      {
        method: 'POST',
        body: JSON.stringify({ accountId, ...withdrawalPayload }),
      }
    );

    // Revalidate cache tags
    safeRevalidateTag(CACHE_TAGS.TRUST_LEDGER);
    safeRevalidateTag(CACHE_TAGS.TRUST_TRANSACTIONS);
    safeRevalidateTag(CACHE_TAGS.TRUST_SUMMARY);
    safeRevalidateTag(CACHE_TAGS.TRUST_ACCOUNT_DETAIL(accountId));

    return {
      success: true,
      message: 'Withdrawal recorded successfully',
      data: transaction,
    };
  } catch (error) {
    console.error('Failed to withdraw funds:', error);

    // Check for zero balance violation from backend
    const errorMessage = error instanceof Error ? error.message : 'Failed to record withdrawal';
    if (errorMessage.includes('insufficient') || errorMessage.includes('negative')) {
      return {
        success: false,
        error: 'Insufficient funds. Trust accounts cannot have negative balances per state bar rules.',
      };
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Perform three-way reconciliation for trust account
 * Matches: bank statement + main ledger + client ledgers
 *
 * @param accountId - Trust account UUID
 * @param input - Reconciliation data including balances and outstanding items
 * @returns Action result with reconciliation status
 *
 * @compliance
 * - Three-Way Match: Verifies bank statement, main ledger, and client ledgers match
 * - Monthly Requirement: State bar typically requires monthly reconciliation
 * - Outstanding Items: Tracks deposits in transit and outstanding checks
 * - Discrepancy Detection: Flags any differences for investigation
 */
export async function reconcileAccount(
  accountId: string,
  input: ReconcileAccountInput
): Promise<ActionResult<{ reconciled: boolean; discrepancyAmount?: number }>> {
  try {
    // Validate required fields
    if (!accountId) {
      return { success: false, error: 'Account ID is required' };
    }

    if (!input.reconciliationDate) {
      return { success: false, error: 'Reconciliation date is required' };
    }

    if (input.bankStatementBalance === undefined || input.bankStatementBalance === null) {
      return { success: false, error: 'Bank statement balance is required' };
    }

    // Build reconciliation payload matching ThreeWayReconciliationDto
    const reconciliationPayload: ThreeWayReconciliationDto = {
      reconciliationDate: input.reconciliationDate,
      bankStatementBalance: input.bankStatementBalance,
      outstandingDeposits: input.outstandingDeposits || 0,
      outstandingWithdrawals: input.outstandingWithdrawals || 0,
      bankAdjustments: input.bankAdjustments || 0,
      notes: input.notes,
    };

    // Execute reconciliation API call
    await apiFetch<void>(`${API_ENDPOINTS.TRUST_LEDGER.RECONCILE}`, {
      method: 'POST',
      body: JSON.stringify({ accountId, ...reconciliationPayload }),
    });

    // Revalidate cache tags
    safeRevalidateTag(CACHE_TAGS.TRUST_LEDGER);
    safeRevalidateTag(CACHE_TAGS.TRUST_TRANSACTIONS);
    safeRevalidateTag(CACHE_TAGS.TRUST_SUMMARY);
    safeRevalidateTag(CACHE_TAGS.TRUST_ACCOUNT_DETAIL(accountId));
    safeRevalidateTag(CACHE_TAGS.TRUST_COMPLIANCE(accountId));

    return {
      success: true,
      message: 'Three-way reconciliation completed successfully',
      data: { reconciled: true },
    };
  } catch (error) {
    console.error('Failed to reconcile account:', error);

    // Check for discrepancy from backend
    const errorMessage = error instanceof Error ? error.message : 'Failed to complete reconciliation';
    if (errorMessage.includes('discrepancy') || errorMessage.includes('mismatch')) {
      return {
        success: false,
        error: `Reconciliation failed: ${errorMessage}. Please review bank statement, main ledger, and client ledgers for discrepancies.`,
      };
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Get comprehensive compliance report for trust account
 *
 * @param accountId - Trust account UUID
 * @param params - Report period parameters
 * @returns Action result with compliance report data
 *
 * @compliance
 * - Account Setup: Checks segregation, account title, state bar approval
 * - Deposit/Withdrawal Rules: Checks commingling, prompt deposit, cash prohibition
 * - Recordkeeping: Checks client ledgers, monthly reconciliation, record retention
 * - Communication: Checks client notification, disputed funds segregation
 */
export async function getComplianceReport(
  accountId: string,
  params: ComplianceReportParams
): Promise<ActionResult<TrustAccountComplianceReport>> {
  try {
    // Validate required fields
    if (!accountId) {
      return { success: false, error: 'Account ID is required' };
    }

    if (!params.periodStart || !params.periodEnd) {
      return { success: false, error: 'Report period start and end dates are required' };
    }

    // Validate date order
    if (new Date(params.periodStart) > new Date(params.periodEnd)) {
      return { success: false, error: 'Period start date must be before end date' };
    }

    // Fetch compliance report from API
    const report = await apiFetch<TrustAccountComplianceReport>(
      `${API_ENDPOINTS.TRUST_ACCOUNTS.DETAIL(accountId)}/compliance-report?start=${params.periodStart}&end=${params.periodEnd}`,
      {
        next: {
          tags: [CACHE_TAGS.TRUST_COMPLIANCE(accountId)],
          revalidate: 300, // 5 minutes cache
        },
      }
    );

    return {
      success: true,
      data: report,
    };
  } catch (error) {
    console.error('Failed to get compliance report:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate compliance report',
    };
  }
}

/**
 * Get client trust ledger statement
 * Individual client ledger showing all transactions for a specific client
 *
 * @param accountId - Trust account UUID
 * @param params - Client ID and statement period
 * @returns Action result with client ledger statement
 *
 * @compliance
 * - Individual Client Ledgers: Provides per-client balance and transaction history
 * - Written Accounting: Must be provided to client upon request or at case conclusion
 */
export async function getClientLedger(
  accountId: string,
  params: ClientLedgerParams
): Promise<ActionResult<ClientTrustLedgerStatement>> {
  try {
    // Validate required fields
    if (!accountId) {
      return { success: false, error: 'Account ID is required' };
    }

    if (!params.clientId) {
      return { success: false, error: 'Client ID is required' };
    }

    if (!params.periodStart || !params.periodEnd) {
      return { success: false, error: 'Statement period start and end dates are required' };
    }

    // Validate date order
    if (new Date(params.periodStart) > new Date(params.periodEnd)) {
      return { success: false, error: 'Period start date must be before end date' };
    }

    // Fetch client ledger from API
    const ledger = await apiFetch<ClientTrustLedgerStatement>(
      `${API_ENDPOINTS.TRUST_ACCOUNTS.DETAIL(accountId)}/client-ledger/${params.clientId}?start=${params.periodStart}&end=${params.periodEnd}`,
      {
        next: {
          tags: [CACHE_TAGS.TRUST_CLIENT_LEDGER(accountId, params.clientId)],
          revalidate: 60, // 1 minute cache
        },
      }
    );

    return {
      success: true,
      data: ledger,
    };
  } catch (error) {
    console.error('Failed to get client ledger:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve client ledger',
    };
  }
}

/**
 * Get trust ledger transactions with optional filters
 *
 * @param filters - Optional filters for transactions
 * @returns Action result with transactions array
 */
export async function getTrustLedgerTransactions(filters?: {
  accountId?: string;
  clientId?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  type?: string;
}): Promise<ActionResult<TrustTransactionEntity[]>> {
  try {
    const params = new URLSearchParams();
    if (filters?.accountId) params.append('accountId', filters.accountId);
    if (filters?.clientId) params.append('clientId', filters.clientId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.type) params.append('type', filters.type);

    const queryString = params.toString();
    const url = queryString
      ? `${API_ENDPOINTS.TRUST_LEDGER.TRANSACTIONS}?${queryString}`
      : API_ENDPOINTS.TRUST_LEDGER.TRANSACTIONS;

    const transactions = await apiFetch<TrustTransactionEntity[]>(url, {
      next: {
        tags: [CACHE_TAGS.TRUST_TRANSACTIONS],
        revalidate: 30,
      },
    });

    return {
      success: true,
      data: transactions,
    };
  } catch (error) {
    console.error('Failed to get trust ledger transactions:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch transactions',
    };
  }
}

/**
 * Get trust ledger summary with calculated balances
 *
 * @returns Action result with summary data
 */
export async function getTrustLedgerSummary(): Promise<ActionResult<TrustLedgerSummary>> {
  try {
    const summary = await apiFetch<TrustLedgerSummary>(API_ENDPOINTS.TRUST_LEDGER.SUMMARY, {
      next: {
        tags: [CACHE_TAGS.TRUST_SUMMARY],
        revalidate: 60,
      },
    });

    return {
      success: true,
      data: summary,
    };
  } catch (error) {
    console.error('Failed to get trust ledger summary:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch summary',
    };
  }
}

/**
 * Form action handler for trust ledger operations
 * Handles form submissions from the trust ledger UI
 */
export async function trustLedgerFormAction(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const intent = formData.get('intent') as string;
  const accountId = formData.get('accountId') as string;

  switch (intent) {
    case 'deposit': {
      const depositInput: DepositFundsInput = {
        amount: parseFloat(formData.get('amount') as string),
        transactionDate: formData.get('transactionDate') as string,
        description: formData.get('description') as string,
        payor: formData.get('payor') as string,
        payorType: formData.get('payorType') as 'client' | 'third_party' | undefined,
        referenceNumber: (formData.get('referenceNumber') as string) || undefined,
        checkNumber: (formData.get('checkNumber') as string) || undefined,
        paymentMethod: (formData.get('paymentMethod') as string) || undefined,
        fundsReceivedDate: (formData.get('fundsReceivedDate') as string) || undefined,
        clientId: (formData.get('clientId') as string) || undefined,
        caseId: (formData.get('caseId') as string) || undefined,
        notes: (formData.get('notes') as string) || undefined,
      };
      return depositFunds(accountId, depositInput);
    }

    case 'withdrawal': {
      const withdrawalInput: WithdrawFundsInput = {
        amount: parseFloat(formData.get('amount') as string),
        transactionDate: formData.get('transactionDate') as string,
        description: formData.get('description') as string,
        payee: formData.get('payee') as string,
        checkNumber: (formData.get('checkNumber') as string) || undefined,
        paymentMethod: formData.get('paymentMethod') as string,
        purpose: formData.get('purpose') as WithdrawFundsInput['purpose'],
        relatedInvoiceId: (formData.get('relatedInvoiceId') as string) || undefined,
        clientId: (formData.get('clientId') as string) || undefined,
        caseId: (formData.get('caseId') as string) || undefined,
        notes: (formData.get('notes') as string) || undefined,
      };
      return withdrawFunds(accountId, withdrawalInput);
    }

    case 'reconcile': {
      const reconcileInput: ReconcileAccountInput = {
        reconciliationDate: formData.get('reconciliationDate') as string,
        bankStatementBalance: parseFloat(formData.get('bankStatementBalance') as string),
        bankStatementDate: (formData.get('bankStatementDate') as string) || undefined,
        outstandingDeposits: formData.get('outstandingDeposits')
          ? parseFloat(formData.get('outstandingDeposits') as string)
          : undefined,
        outstandingWithdrawals: formData.get('outstandingWithdrawals')
          ? parseFloat(formData.get('outstandingWithdrawals') as string)
          : undefined,
        outstandingChecks: formData.get('outstandingChecks')
          ? JSON.parse(formData.get('outstandingChecks') as string)
          : undefined,
        depositsInTransit: formData.get('depositsInTransit')
          ? JSON.parse(formData.get('depositsInTransit') as string)
          : undefined,
        bankAdjustments: formData.get('bankAdjustments')
          ? parseFloat(formData.get('bankAdjustments') as string)
          : undefined,
        notes: (formData.get('notes') as string) || undefined,
      };
      return reconcileAccount(accountId, reconcileInput);
    }

    case 'compliance-report': {
      const reportParams: ComplianceReportParams = {
        periodStart: formData.get('periodStart') as string,
        periodEnd: formData.get('periodEnd') as string,
      };
      return getComplianceReport(accountId, reportParams);
    }

    case 'client-ledger': {
      const ledgerParams: ClientLedgerParams = {
        clientId: formData.get('clientId') as string,
        periodStart: formData.get('periodStart') as string,
        periodEnd: formData.get('periodEnd') as string,
      };
      return getClientLedger(accountId, ledgerParams);
    }

    default:
      return { success: false, error: 'Invalid action' };
  }
}
