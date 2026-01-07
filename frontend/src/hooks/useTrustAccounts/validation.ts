/**
 * Validation utilities for trust accounts
 * @module hooks/useTrustAccounts/validation
 */

import type { TrustAccountValidationResult } from "@/types";
import { PaymentMethod } from "@/types";
import { COMPLIANCE_THRESHOLDS } from "./constants";

/**
 * Validate account title compliance
 * Per state bar rules: Account name must include "Trust Account" or "Escrow Account"
 */
export function validateAccountTitle(accountName: string): boolean {
  const normalizedName = accountName.toLowerCase();
  return (
    normalizedName.includes("trust account") ||
    normalizedName.includes("escrow account")
  );
}

/**
 * Validate payment method for withdrawals
 * Per state bar rules: CASH and ATM withdrawals are PROHIBITED
 */
export function validatePaymentMethod(
  paymentMethod: PaymentMethod,
  isWithdrawal: boolean
): TrustAccountValidationResult {
  if (!isWithdrawal) {
    return { valid: true, errors: [] };
  }

  const prohibitedMethods = [PaymentMethod.CASH, PaymentMethod.ATM];
  if (prohibitedMethods.includes(paymentMethod)) {
    return {
      valid: false,
      errors: [
        `${paymentMethod.toUpperCase()} withdrawals are prohibited by state bar rules`,
      ],
      warnings: [],
    };
  }

  return { valid: true, errors: [] };
}

/**
 * Validate prompt deposit compliance
 * Per state bar rules: Client funds must be deposited within 24-48 hours of receipt
 */
export function validatePromptDeposit(
  fundsReceivedDate: Date,
  depositDate: Date
): boolean {
  const hoursDifference =
    (depositDate.getTime() - fundsReceivedDate.getTime()) / (1000 * 60 * 60);
  return hoursDifference <= COMPLIANCE_THRESHOLDS.PROMPT_DEPOSIT_HOURS;
}

/**
 * Validate zero balance principle
 * Per state bar rules: Account balance must never be negative
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
