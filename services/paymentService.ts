import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface CardPaymentRequest {
  amount: number;
  currency: string;
  cardDetails: {
    number: string;
    name: string;
    expMonth: string;
    expYear: string;
    cvv: string;
    zip: string;
  };
  invoiceId?: string;
  saveCard?: boolean;
}

export interface PayPalPaymentRequest {
  amount: number;
  currency: string;
  invoiceId?: string;
}

export interface SavedMethodPaymentRequest {
  amount: number;
  currency: string;
  paymentMethodId: string;
  invoiceId?: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentId: string;
  status: string;
  clientSecret?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  last4: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

class PaymentService {
  /**
   * Process card payment
   */
  async processCardPayment(request: CardPaymentRequest): Promise<PaymentResponse> {
    const response = await axios.post(`${API_BASE}/api/billing/payment/card`, request);
    return response.data;
  }

  /**
   * Process PayPal payment
   */
  async processPayPalPayment(request: PayPalPaymentRequest): Promise<PaymentResponse> {
    const response = await axios.post(`${API_BASE}/api/billing/payment/paypal`, request);
    return response.data;
  }

  /**
   * Process payment with saved method
   */
  async processSavedMethodPayment(request: SavedMethodPaymentRequest): Promise<PaymentResponse> {
    const response = await axios.post(`${API_BASE}/api/billing/payment/saved`, request);
    return response.data;
  }

  /**
   * Get saved payment methods
   */
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const response = await axios.get(`${API_BASE}/api/billing/payment/methods`);
    return response.data;
  }

  /**
   * Remove saved payment method
   */
  async removePaymentMethod(methodId: string): Promise<void> {
    await axios.delete(`${API_BASE}/api/billing/payment/methods/${methodId}`);
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string): Promise<any> {
    const response = await axios.get(`${API_BASE}/api/billing/payment/${paymentId}/status`);
    return response.data;
  }

  /**
   * Process refund
   */
  async processRefund(paymentId: string, amount?: number, reason?: string): Promise<any> {
    const response = await axios.post(`${API_BASE}/api/billing/payment/${paymentId}/refund`, {
      amount,
      reason,
    });
    return response.data;
  }

  /**
   * Calculate processing fee
   */
  calculateProcessingFee(amount: number, gateway: 'stripe' | 'paypal' = 'stripe'): number {
    if (gateway === 'stripe') {
      return (amount * 0.029) + 0.30;
    } else {
      return (amount * 0.0299) + 0.49;
    }
  }

  /**
   * Get net amount after fees
   */
  getNetAmount(amount: number, gateway: 'stripe' | 'paypal' = 'stripe'): number {
    const fee = this.calculateProcessingFee(amount, gateway);
    return amount - fee;
  }
}

export const paymentService = new PaymentService();
