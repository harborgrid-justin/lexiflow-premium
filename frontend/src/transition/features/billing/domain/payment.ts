/**
 * Payment domain model
 */

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  processedAt: string;
  createdAt: string;
}

export type PaymentMethod =
  | "credit_card"
  | "bank_transfer"
  | "paypal"
  | "stripe";

export type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "refunded";
