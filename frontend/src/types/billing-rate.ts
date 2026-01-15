/**
 * Billing Rate Type
 * Simple billing rate structure for time entries
 */
export interface BillingRate {
  id: string;
  userId: string;
  userName?: string;
  role?: string;
  hourlyRate: number;
  currency: string;
  effectiveDate: string;
  expiryDate?: string;
  isActive: boolean;
}
