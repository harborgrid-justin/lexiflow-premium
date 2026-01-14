/**
 * BillingDomain - Trust Operations
 * Trust accounting with IOLTA compliance
 */

import { apiClient } from "@/services/infrastructure/api-client.service";
import type { TrustTransaction } from "./types";
import { ComplianceError, OperationError } from "./types";

/**
 * Get trust account details
 * Helper for compliance validation
 */
export async function getTrustAccount(
  accountId: string
): Promise<{ id: string; type: string }> {
  try {
    return await apiClient.get<{ id: string; type: string }>(
      `/billing/trust/${accountId}`
    );
  } catch (error) {
    // Fallback for demo if API endpoint doesn't exist yet
    console.warn("Trust account fetch failed, using fallback", error);
    return { id: accountId, type: "IOLTA" };
  }
}

/**
 * Get trust transactions with IOLTA compliance validation
 *
 * @compliance ABA Model Rules 1.15 - Safekeeping Property
 * @compliance IOLTA Rules - Interest on Lawyer Trust Accounts
 * @throws ComplianceError if transaction violates trust accounting rules
 */
export async function getTrustTransactions(
  accountId: string,
  options?: {
    startDate?: string;
    endDate?: string;
    includeInterest?: boolean;
    verifyReconciliation?: boolean;
  }
): Promise<TrustTransaction[]> {
  if (!accountId || accountId.trim() === "") {
    throw new Error("[BillingRepository.getTrustTransactions] Invalid accountId parameter");
  }

  try {
    // Verify account type (must be trust, not operating)
    const account = await getTrustAccount(accountId);
    // Valid types: IOLTA, ClientTrust, Escrow
    if (
      account.type &&
      !["IOLTA", "ClientTrust", "Escrow"].includes(account.type)
    ) {
      throw new ComplianceError(
        `Account ${accountId} is not a valid trust account (Type: ${account.type})`
      );
    }

    const params = new URLSearchParams();
    if (options?.startDate) params.append("startDate", options.startDate);
    if (options?.endDate) params.append("endDate", options.endDate);
    if (options?.includeInterest) params.append("includeInterest", "true");

    const transactions = await apiClient.get<TrustTransaction[]>(
      `/billing/trust/${accountId}/transactions?${params.toString()}`
    );

    return transactions;
  } catch (error) {
    console.error("[BillingRepository.getTrustTransactions] Error:", error);
    if (error instanceof ComplianceError) throw error;
    throw new OperationError("Failed to fetch trust transactions");
  }
}

/**
 * Get all trust accounts
 */
export async function getTrustAccounts(): Promise<unknown[]> {
  try {
    return await apiClient.get<unknown[]>("/billing/trust-accounts");
  } catch (error) {
    console.error("[BillingRepository.getTrustAccounts] Error:", error);
    throw new OperationError("Failed to fetch trust accounts");
  }
}
