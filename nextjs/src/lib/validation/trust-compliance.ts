/**
 * Trust Account Compliance Validation
 *
 * Server-side validation utilities for IOLTA trust account compliance.
 * Implements state bar requirements for trust account management:
 * - Account title compliance
 * - Payment method validation (cash/ATM prohibition)
 * - Prompt deposit compliance (24-48 hour rule)
 * - Zero balance principle enforcement
 * - Compliance issue identification
 *
 * @module lib/validation/trust-compliance
 * @see State Bar Trust Account Rules for compliance requirements
 */

import type {
  TrustAccount,
  TrustAccountValidationResult,
  PaymentMethod,
} from '@/types/trust-accounts';

// =============================================================================
// Constants
// =============================================================================

/**
 * Compliance threshold constants
 * Aligned with frontend implementation at:
 * frontend/src/hooks/useTrustAccounts/constants.ts
 */
export const COMPLIANCE_THRESHOLDS = {
  /** Days after which reconciliation overdue becomes an error vs warning */
  RECONCILIATION_WARNING_DAYS: 7,
  /** Maximum hours allowed for prompt deposit compliance */
  PROMPT_DEPOSIT_HOURS: 48,
  /** Warning threshold for prompt deposit (best practice) */
  PROMPT_DEPOSIT_WARNING_HOURS: 24,
} as const;

/**
 * Payment methods prohibited for withdrawals per state bar rules
 */
export const PROHIBITED_WITHDRAWAL_METHODS: readonly string[] = [
  'cash',
  'atm',
  'CASH',
  'ATM',
] as const;

// =============================================================================
// Type Definitions
// =============================================================================

/**
 * Compliance issue severity levels
 */
export type ComplianceIssueSeverity = 'warning' | 'error';

/**
 * Compliance issue definition
 * Matches frontend type at: frontend/src/hooks/useTrustAccounts/types.ts
 */
export interface ComplianceIssue {
  /** Trust account ID associated with the issue */
  accountId: string;
  /** Human-readable description of the compliance issue */
  issue: string;
  /** Severity level: warning for best practice violations, error for compliance violations */
  severity: ComplianceIssueSeverity;
}

/**
 * Prompt deposit compliance check result
 */
export interface PromptDepositCheckResult {
  /** Whether the deposit timing is compliant with state bar rules */
  compliant: boolean;
  /** Warning message for deposits between 24-48 hours */
  warning?: string;
  /** Violation message for deposits after 48 hours */
  violation?: string;
  /** Number of hours between funds receipt and deposit */
  hoursDifference?: number;
}

/**
 * Payment method compliance check result
 */
export interface PaymentMethodCheckResult {
  /** Whether the payment method is compliant */
  compliant: boolean;
  /** Violation message if non-compliant */
  violation?: string;
}

/**
 * Zero balance check result
 */
export interface ZeroBalanceCheckResult {
  /** Whether the balance remains non-negative after the transaction */
  valid: boolean;
  /** The projected balance after the transaction */
  newBalance: number;
  /** Shortfall amount if balance would go negative */
  shortfall?: number;
}

// =============================================================================
// Account Title Validation
// =============================================================================

/**
 * Validate account title compliance
 *
 * Per state bar rules: Account name must include "Trust Account" or "Escrow Account"
 * This ensures proper identification of fiduciary accounts.
 *
 * @param accountName - The account name to validate
 * @returns true if the account name is compliant, false otherwise
 *
 * @example
 * validateAccountTitle("Smith Law Firm Trust Account") // true
 * validateAccountTitle("Client Escrow Account") // true
 * validateAccountTitle("Operating Account") // false
 *
 * @see frontend/src/hooks/useTrustAccounts/validation.ts lines 14-20
 */
export function validateAccountTitle(accountName: string): boolean {
  if (!accountName || typeof accountName !== 'string') {
    return false;
  }

  const normalizedName = accountName.toLowerCase();
  return (
    normalizedName.includes('trust account') ||
    normalizedName.includes('escrow account')
  );
}

// =============================================================================
// Payment Method Validation
// =============================================================================

/**
 * Validate payment method for withdrawals
 *
 * Per state bar rules: CASH and ATM withdrawals are PROHIBITED from trust accounts.
 * This prevents untracked disbursements and ensures proper documentation.
 *
 * @param paymentMethod - The payment method being used
 * @param isWithdrawal - Whether this is a withdrawal transaction
 * @returns Validation result with errors array if invalid
 *
 * @example
 * validatePaymentMethod('CHECK', true) // { valid: true, errors: [] }
 * validatePaymentMethod('CASH', true) // { valid: false, errors: ['CASH withdrawals are prohibited...'] }
 * validatePaymentMethod('CASH', false) // { valid: true, errors: [] } - Deposits not restricted
 *
 * @see frontend/src/hooks/useTrustAccounts/validation.ts lines 26-46
 */
export function validatePaymentMethod(
  paymentMethod: PaymentMethod | string,
  isWithdrawal: boolean
): TrustAccountValidationResult {
  // Deposits are not restricted by payment method
  if (!isWithdrawal) {
    return { valid: true, errors: [] };
  }

  // Check if payment method is prohibited for withdrawals
  const normalizedMethod = String(paymentMethod).toLowerCase();
  const isProhibited = PROHIBITED_WITHDRAWAL_METHODS.some(
    (method) => method.toLowerCase() === normalizedMethod
  );

  if (isProhibited) {
    return {
      valid: false,
      errors: [
        `${String(paymentMethod).toUpperCase()} withdrawals are prohibited by state bar rules. Use CHECK, WIRE, ACH, or EFT instead.`,
      ],
      warnings: [],
    };
  }

  return { valid: true, errors: [] };
}

/**
 * Check cash withdrawal prohibition (internal helper with detailed result)
 *
 * @param paymentMethod - The payment method to check
 * @returns Compliance check result with violation message if applicable
 */
export function checkCashWithdrawalProhibition(
  paymentMethod: string
): PaymentMethodCheckResult {
  if (!paymentMethod) {
    return { compliant: true };
  }

  const normalizedMethod = paymentMethod.toLowerCase();
  const isProhibited = PROHIBITED_WITHDRAWAL_METHODS.some(
    (method) => method.toLowerCase() === normalizedMethod
  );

  if (isProhibited) {
    return {
      compliant: false,
      violation: `Cash and ATM withdrawals are prohibited from trust accounts per state bar rules. Use check, wire, ACH, or EFT instead.`,
    };
  }

  return { compliant: true };
}

// =============================================================================
// Prompt Deposit Validation
// =============================================================================

/**
 * Validate prompt deposit compliance
 *
 * Per state bar rules: Client funds must be deposited within 24-48 hours of receipt.
 * Most jurisdictions require deposit within 48 hours; 24 hours is recommended best practice.
 *
 * @param fundsReceivedDate - The date/time when funds were received
 * @param depositDate - The date/time when funds were deposited
 * @returns true if compliant (deposited within threshold), false otherwise
 *
 * @example
 * // Deposited within 24 hours - compliant
 * validatePromptDeposit(new Date('2025-01-01T10:00:00'), new Date('2025-01-01T18:00:00')) // true
 *
 * // Deposited after 48 hours - non-compliant
 * validatePromptDeposit(new Date('2025-01-01T10:00:00'), new Date('2025-01-04T10:00:00')) // false
 *
 * @see frontend/src/hooks/useTrustAccounts/validation.ts lines 52-59
 */
export function validatePromptDeposit(
  fundsReceivedDate: Date,
  depositDate: Date
): boolean {
  if (!(fundsReceivedDate instanceof Date) || !(depositDate instanceof Date)) {
    return false;
  }

  if (isNaN(fundsReceivedDate.getTime()) || isNaN(depositDate.getTime())) {
    return false;
  }

  const hoursDifference =
    (depositDate.getTime() - fundsReceivedDate.getTime()) / (1000 * 60 * 60);

  return hoursDifference <= COMPLIANCE_THRESHOLDS.PROMPT_DEPOSIT_HOURS;
}

/**
 * Check prompt deposit compliance with detailed result
 *
 * Returns warnings for 24-48 hour deposits and violations for >48 hour deposits.
 * Used for generating compliance warnings in transaction processing.
 *
 * @param fundsReceivedDate - ISO date string when funds were received (optional)
 * @param transactionDate - ISO date string when deposit was made
 * @returns Detailed compliance check result with warning/violation messages
 */
export function checkPromptDepositCompliance(
  fundsReceivedDate: string | undefined,
  transactionDate: string
): PromptDepositCheckResult {
  // If funds received date not provided, we cannot verify compliance
  if (!fundsReceivedDate) {
    return {
      compliant: true,
      warning:
        'Funds received date not provided - unable to verify prompt deposit compliance',
    };
  }

  const received = new Date(fundsReceivedDate);
  const deposited = new Date(transactionDate);

  // Validate date parsing
  if (isNaN(received.getTime()) || isNaN(deposited.getTime())) {
    return {
      compliant: false,
      violation: 'Invalid date format for prompt deposit compliance check',
    };
  }

  const hoursDifference =
    Math.abs(deposited.getTime() - received.getTime()) / (1000 * 60 * 60);

  // Violation: More than 48 hours
  if (hoursDifference > COMPLIANCE_THRESHOLDS.PROMPT_DEPOSIT_HOURS) {
    return {
      compliant: false,
      violation: `Deposit made ${Math.round(hoursDifference)} hours after funds received. State bar rules require deposit within ${COMPLIANCE_THRESHOLDS.PROMPT_DEPOSIT_HOURS} hours.`,
      hoursDifference,
    };
  }

  // Warning: Between 24-48 hours (best practice violation)
  if (hoursDifference > COMPLIANCE_THRESHOLDS.PROMPT_DEPOSIT_WARNING_HOURS) {
    return {
      compliant: true,
      warning: `Deposit made ${Math.round(hoursDifference)} hours after funds received. Consider depositing within ${COMPLIANCE_THRESHOLDS.PROMPT_DEPOSIT_WARNING_HOURS} hours for best practices.`,
      hoursDifference,
    };
  }

  // Fully compliant: Within 24 hours
  return { compliant: true, hoursDifference };
}

// =============================================================================
// Zero Balance Validation
// =============================================================================

/**
 * Validate zero balance principle
 *
 * Per state bar rules: Account balance must never be negative.
 * Trust accounts must maintain sufficient funds to cover all client obligations.
 *
 * @param currentBalance - The current account balance
 * @param withdrawalAmount - The proposed withdrawal amount
 * @returns Validation result with error if withdrawal would cause negative balance
 *
 * @example
 * validateZeroBalance(1000, 500) // { valid: true, errors: [] }
 * validateZeroBalance(500, 750) // { valid: false, errors: ['Insufficient funds...'] }
 *
 * @see frontend/src/hooks/useTrustAccounts/validation.ts lines 65-82
 */
export function validateZeroBalance(
  currentBalance: number,
  withdrawalAmount: number
): TrustAccountValidationResult {
  const newBalance = currentBalance - withdrawalAmount;

  if (newBalance < 0) {
    return {
      valid: false,
      errors: [
        `Insufficient funds. Current balance: $${currentBalance.toFixed(2)}, Withdrawal: $${withdrawalAmount.toFixed(2)}, Shortfall: $${Math.abs(newBalance).toFixed(2)}`,
      ],
      warnings: [],
    };
  }

  return { valid: true, errors: [] };
}

/**
 * Check zero balance with detailed result (internal helper)
 *
 * @param currentBalance - Current account balance
 * @param withdrawalAmount - Proposed withdrawal amount
 * @returns Detailed check result with new balance and shortfall
 */
export function checkZeroBalance(
  currentBalance: number,
  withdrawalAmount: number
): ZeroBalanceCheckResult {
  const newBalance = currentBalance - withdrawalAmount;

  if (newBalance < 0) {
    return {
      valid: false,
      newBalance,
      shortfall: Math.abs(newBalance),
    };
  }

  return { valid: true, newBalance };
}

// =============================================================================
// Compliance Issue Identification
// =============================================================================

/**
 * Identify compliance issues across trust accounts
 *
 * Performs comprehensive compliance analysis including:
 * - Negative balance detection (zero balance principle violation)
 * - Account title compliance check (must include "Trust" or "Escrow")
 * - Reconciliation overdue detection (monthly requirement)
 * - State bar approval verification (overdraft reporting)
 * - Authorized signatories validation
 *
 * @param accounts - Array of trust accounts to analyze
 * @returns Array of compliance issues found across all accounts
 *
 * @example
 * const issues = identifyComplianceIssues(accounts);
 * const errors = issues.filter(i => i.severity === 'error');
 * const warnings = issues.filter(i => i.severity === 'warning');
 *
 * @see frontend/src/hooks/useTrustAccounts/utils.ts lines 49-116
 */
export function identifyComplianceIssues(
  accounts: TrustAccount[]
): ComplianceIssue[] {
  const issues: ComplianceIssue[] = [];

  if (!Array.isArray(accounts)) {
    return issues;
  }

  accounts.forEach((account) => {
    if (!account || !account.id) {
      return;
    }

    // Negative balance check - CRITICAL VIOLATION
    // Per zero balance principle: Trust accounts must never have negative balances
    if (account.balance < 0) {
      issues.push({
        accountId: account.id,
        issue: 'Negative balance detected - violates zero balance principle',
        severity: 'error',
      });
    }

    // Account title compliance check
    // Account name must include "Trust Account" or "Escrow Account"
    if (account.accountTitleCompliant === false) {
      issues.push({
        accountId: account.id,
        issue: 'Account title must include "Trust Account" or "Escrow Account"',
        severity: 'error',
      });
    } else if (
      account.accountTitleCompliant === undefined &&
      account.accountName &&
      !validateAccountTitle(account.accountName)
    ) {
      // If accountTitleCompliant flag not set, validate the name directly
      issues.push({
        accountId: account.id,
        issue: 'Account title must include "Trust Account" or "Escrow Account"',
        severity: 'error',
      });
    }

    // Reconciliation overdue check
    // Monthly three-way reconciliation is required by state bar
    if (account.nextReconciliationDue) {
      const dueDate = new Date(account.nextReconciliationDue);
      const now = new Date();

      if (!isNaN(dueDate.getTime())) {
        const daysOverdue = Math.floor(
          (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysOverdue > 0) {
          issues.push({
            accountId: account.id,
            issue: `Reconciliation overdue by ${daysOverdue} day(s)`,
            severity:
              daysOverdue > COMPLIANCE_THRESHOLDS.RECONCILIATION_WARNING_DAYS
                ? 'error'
                : 'warning',
          });
        }
      }
    }

    // State bar approval check
    // Bank must be approved by state bar for overdraft reporting
    if (account.stateBarApproved === false) {
      issues.push({
        accountId: account.id,
        issue: 'Bank is not approved by state bar for overdraft reporting',
        severity: 'warning',
      });
    }

    // Authorized signatories check
    // Trust accounts must have defined authorized signatories
    if (
      !account.authorizedSignatories ||
      account.authorizedSignatories.length === 0
    ) {
      issues.push({
        accountId: account.id,
        issue: 'No authorized signatories defined',
        severity: 'error',
      });
    }
  });

  return issues;
}

// =============================================================================
// Validation Helpers
// =============================================================================

/**
 * Validate check number is provided for CHECK payment method
 *
 * Trust accounts must use pre-numbered checks for accountability.
 *
 * @param paymentMethod - The payment method being used
 * @param checkNumber - The check number (if applicable)
 * @returns Validation result with error if check number missing for CHECK method
 */
export function validateCheckNumber(
  paymentMethod: string,
  checkNumber: string | undefined
): { valid: boolean; error?: string } {
  if (
    paymentMethod &&
    paymentMethod.toLowerCase() === 'check' &&
    !checkNumber
  ) {
    return {
      valid: false,
      error:
        'Check number is required when payment method is CHECK. Trust accounts must use pre-numbered checks.',
    };
  }
  return { valid: true };
}

/**
 * Calculate hours between two dates
 *
 * @param startDate - Start date (ISO string or Date)
 * @param endDate - End date (ISO string or Date)
 * @returns Number of hours between dates (absolute value)
 */
export function calculateHoursBetween(
  startDate: string | Date,
  endDate: string | Date
): number {
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const end = endDate instanceof Date ? endDate : new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return 0;
  }

  return Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60);
}

/**
 * Validate transaction amount
 *
 * @param amount - The transaction amount to validate
 * @returns Validation result with error if amount invalid
 */
export function validateTransactionAmount(amount: number): {
  valid: boolean;
  error?: string;
} {
  if (amount === undefined || amount === null) {
    return { valid: false, error: 'Transaction amount is required' };
  }

  if (typeof amount !== 'number' || isNaN(amount)) {
    return { valid: false, error: 'Transaction amount must be a valid number' };
  }

  if (amount <= 0) {
    return {
      valid: false,
      error: 'Transaction amount must be greater than zero',
    };
  }

  return { valid: true };
}

/**
 * Validate required string field
 *
 * @param value - The string value to validate
 * @param fieldName - Name of the field for error message
 * @returns Validation result with error if empty
 */
export function validateRequiredString(
  value: string | undefined | null,
  fieldName: string
): { valid: boolean; error?: string } {
  if (!value || typeof value !== 'string' || !value.trim()) {
    return { valid: false, error: `${fieldName} is required` };
  }
  return { valid: true };
}

// =============================================================================
// Comprehensive Validation
// =============================================================================

/**
 * Validate a deposit transaction for compliance
 *
 * @param params - Deposit parameters to validate
 * @returns Combined validation result with all errors and warnings
 */
export function validateDeposit(params: {
  amount: number;
  description?: string;
  payor?: string;
  fundsReceivedDate?: string;
  transactionDate: string;
}): TrustAccountValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate amount
  const amountValidation = validateTransactionAmount(params.amount);
  if (!amountValidation.valid && amountValidation.error) {
    errors.push(amountValidation.error);
  }

  // Validate required fields
  const descriptionValidation = validateRequiredString(
    params.description,
    'Transaction description'
  );
  if (!descriptionValidation.valid && descriptionValidation.error) {
    errors.push(descriptionValidation.error);
  }

  const payorValidation = validateRequiredString(params.payor, 'Payor name');
  if (!payorValidation.valid && payorValidation.error) {
    errors.push(payorValidation.error);
  }

  // Check prompt deposit compliance
  const promptDepositCheck = checkPromptDepositCompliance(
    params.fundsReceivedDate,
    params.transactionDate
  );
  if (!promptDepositCheck.compliant && promptDepositCheck.violation) {
    warnings.push(promptDepositCheck.violation); // Violation is a warning, not blocking
  } else if (promptDepositCheck.warning) {
    warnings.push(promptDepositCheck.warning);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Validate a withdrawal transaction for compliance
 *
 * @param params - Withdrawal parameters to validate
 * @returns Combined validation result with all errors and warnings
 */
export function validateWithdrawal(params: {
  amount: number;
  currentBalance: number;
  description?: string;
  payee?: string;
  paymentMethod: string;
  checkNumber?: string;
}): TrustAccountValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate amount
  const amountValidation = validateTransactionAmount(params.amount);
  if (!amountValidation.valid && amountValidation.error) {
    errors.push(amountValidation.error);
  }

  // Validate required fields
  const descriptionValidation = validateRequiredString(
    params.description,
    'Transaction description'
  );
  if (!descriptionValidation.valid && descriptionValidation.error) {
    errors.push(descriptionValidation.error);
  }

  const payeeValidation = validateRequiredString(params.payee, 'Payee name');
  if (!payeeValidation.valid && payeeValidation.error) {
    errors.push(payeeValidation.error);
  }

  // Check payment method compliance
  const paymentMethodValidation = validatePaymentMethod(
    params.paymentMethod,
    true
  );
  if (!paymentMethodValidation.valid) {
    errors.push(...paymentMethodValidation.errors);
  }

  // Validate check number for CHECK payment method
  const checkValidation = validateCheckNumber(
    params.paymentMethod,
    params.checkNumber
  );
  if (!checkValidation.valid && checkValidation.error) {
    errors.push(checkValidation.error);
  }

  // Check zero balance principle
  const zeroBalanceValidation = validateZeroBalance(
    params.currentBalance,
    params.amount
  );
  if (!zeroBalanceValidation.valid) {
    errors.push(...zeroBalanceValidation.errors);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}
