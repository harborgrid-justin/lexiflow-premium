/**
 * Trust Accounts API Service
 * IOLTA and trust account management
 */

import { apiClient } from '../apiClient';

export interface TrustAccount {
  id: string;
  clientId: string;
  accountNumber: string;
  accountName: string;
  bankName?: string;
  balance: number;
  currency: string;
  status: 'active' | 'frozen' | 'closed';
  accountType: 'iolta' | 'client_trust' | 'retainer';
  openedDate: string;
  closedDate?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface TrustTransaction {
  id: string;
  trustAccountId: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'interest';
  amount: number;
  description: string;
  date: string;
  balanceAfter: number;
  reference?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
}

export interface TrustAccountFilters {
  clientId?: string;
  status?: TrustAccount['status'];
  accountType?: TrustAccount['accountType'];
}

export class TrustAccountsApiService {
  private readonly baseUrl = '/trust-accounts';

  async getAll(filters?: TrustAccountFilters): Promise<TrustAccount[]> {
    const params = new URLSearchParams();
    if (filters?.clientId) params.append('clientId', filters.clientId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.accountType) params.append('accountType', filters.accountType);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    return apiClient.get<TrustAccount[]>(url);
  }

  async getById(id: string): Promise<TrustAccount> {
    return apiClient.get<TrustAccount>(`${this.baseUrl}/${id}`);
  }

  async create(data: Partial<TrustAccount>): Promise<TrustAccount> {
    return apiClient.post<TrustAccount>(this.baseUrl, data);
  }

  async update(id: string, data: Partial<TrustAccount>): Promise<TrustAccount> {
    return apiClient.put<TrustAccount>(`${this.baseUrl}/${id}`, data);
  }

  async getTransactions(accountId: string, filters?: { startDate?: string; endDate?: string }): Promise<TrustTransaction[]> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}/${accountId}/transactions?${queryString}` : `${this.baseUrl}/${accountId}/transactions`;
    return apiClient.get<TrustTransaction[]>(url);
  }

  async addTransaction(accountId: string, transaction: Partial<TrustTransaction>): Promise<TrustTransaction> {
    return apiClient.post<TrustTransaction>(`${this.baseUrl}/${accountId}/transactions`, transaction);
  }

  async reconcile(accountId: string, data: { date: string; balance: number }): Promise<any> {
    return apiClient.post(`${this.baseUrl}/${accountId}/reconcile`, data);
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }
}
