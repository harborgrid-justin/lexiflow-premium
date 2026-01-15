/**
 * Utility functions for useTrustAccounts hooks
 * @module hooks/useTrustAccounts/utils
 */

import type { TrustAccount, TrustTransactionEntity } from "@/types";
import { TrustAccountStatus } from "@/types";
import { COMPLIANCE_THRESHOLDS } from "./constants";
import type { ComplianceIssue } from "./types";

/**
 * Calculate total balance across all accounts
 */
export function calculateTotalBalance(accounts: TrustAccount[]): number {
  return accounts.reduce((sum, account) => sum + account.balance, 0);
}

/**
 * Filter IOLTA accounts
 */
export function filterIoltaAccounts(accounts: TrustAccount[]): TrustAccount[] {
  return accounts.filter((acc) => acc.accountType === "iolta");
}

/**
 * Filter active accounts
 */
export function filterActiveAccounts(accounts: TrustAccount[]): TrustAccount[] {
  return accounts.filter((acc) => acc.status === TrustAccountStatus.ACTIVE);
}

/**
 * Find accounts needing reconciliation
 */
export function findAccountsNeedingReconciliation(
  accounts: TrustAccount[]
): TrustAccount[] {
  const now = new Date();
  return accounts.filter((acc) => {
    if (!acc.nextReconciliationDue) return false;
    const dueDate = new Date(acc.nextReconciliationDue);
    return dueDate <= now;
  });
}

/**
 * Identify compliance issues across accounts
 */
export function identifyComplianceIssues(
  accounts: TrustAccount[]
): ComplianceIssue[] {
  const issues: ComplianceIssue[] = [];

  accounts.forEach((account) => {
    // Negative balance check
    if (account.balance < 0) {
      issues.push({
        accountId: account.id,
        issue: "Negative balance detected - violates zero balance principle",
        severity: "error",
      });
    }

    // Account title compliance
    if (!account.accountTitleCompliant) {
      issues.push({
        accountId: account.id,
        issue: 'Account title must include "Trust Account" or "Escrow Account"',
        severity: "error",
      });
    }

    // Reconciliation overdue
    if (account.nextReconciliationDue) {
      const dueDate = new Date(account.nextReconciliationDue);
      const now = new Date();
      const daysOverdue = Math.floor(
        (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysOverdue > 0) {
        issues.push({
          accountId: account.id,
          issue: `Reconciliation overdue by ${daysOverdue} day(s)`,
          severity:
            daysOverdue > COMPLIANCE_THRESHOLDS.RECONCILIATION_WARNING_DAYS
              ? "error"
              : "warning",
        });
      }
    }

    // State bar approval check
    if (!account.stateBarApproved) {
      issues.push({
        accountId: account.id,
        issue: "Bank is not approved by state bar for overdraft reporting",
        severity: "warning",
      });
    }

    // Missing authorized signatories
    if (
      !account.authorizedSignatories ||
      account.authorizedSignatories.length === 0
    ) {
      issues.push({
        accountId: account.id,
        issue: "No authorized signatories defined",
        severity: "error",
      });
    }
  });

  return issues;
}

/**
 * Calculate total deposits from transactions
 */
export function calculateTotalDeposits(
  transactions: TrustTransactionEntity[]
): number {
  return transactions
    .filter((tx) => tx.transactionType === "deposit")
    .reduce((sum, tx) => sum + tx.amount, 0);
}

/**
 * Calculate total withdrawals from transactions
 */
export function calculateTotalWithdrawals(
  transactions: TrustTransactionEntity[]
): number {
  return transactions
    .filter((tx) => tx.transactionType === "withdrawal")
    .reduce((sum, tx) => sum + tx.amount, 0);
}

/**
 * Filter pending transactions
 */
export function filterPendingTransactions(
  transactions: TrustTransactionEntity[]
): TrustTransactionEntity[] {
  return transactions.filter((tx) => tx.status === "pending");
}

/**
 * Find last reconciliation date from transactions
 */
export function findLastReconciliationDate(
  transactions: TrustTransactionEntity[]
): string | null {
  const reconciledTransactions = transactions.filter((tx) => tx.reconciled);
  if (reconciledTransactions.length === 0) return null;

  return reconciledTransactions.reduce(
    (latest: string | null, tx: TrustTransactionEntity) => {
      if (!tx.reconciledDate) return latest;
      return !latest || new Date(tx.reconciledDate) > new Date(latest)
        ? tx.reconciledDate
        : latest;
    },
    null as string | null
  );
}

import type { TrustAccountError } from "./types";

/**
 * Transform query error to structured error
 */
export function transformQueryError(
  queryError: unknown
): TrustAccountError | null {
  if (!queryError) return null;

  const err = queryError as Error;
  return {
    code: "API_ERROR",
    message: err.message || "Failed to load trust accounts",
    details: { originalError: err },
  };
}
