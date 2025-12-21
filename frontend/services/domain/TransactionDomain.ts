/**
 * TransactionDomain - Financial transaction management service
 * Provides transaction tracking, balance calculation, and reconciliation
 * ✅ Migrated to backend API (2025-12-21)
 */

import { api } from '../api';
import { delay } from '../../utils/async';

interface Transaction {
  id: string;
  type: 'invoice' | 'payment' | 'expense' | 'refund' | 'adjustment';
  amount: number;
  currency: string;
  description: string;
  date: string;
  caseId?: string;
  matterId?: string;
  status: 'pending' | 'completed' | 'reconciled' | 'failed';
  paymentMethod?: string;
  reference?: string;
  metadata?: any;
}

interface Balance {
  total: number;
  pending: number;
  reconciled: number;
  currency: string;
}

export const TransactionService = {
  getAll: async () => api.billing?.transactions?.getAll?.() || [],
  getById: async (id: string) => api.billing?.transactions?.getById?.(id),
  
  add: async (item: any) => {
    const transaction = { 
      ...item, 
      createdAt: new Date().toISOString(),
      status: item.status || 'pending'
    };
    return api.billing?.transactions?.create?.(transaction) || transaction;
  },
  
  update: async (id: string, updates: any) => {
    return api.billing?.transactions?.update?.(id, updates) || { id, ...updates };
  },
  
  delete: async (id: string) => {
    await api.billing?.transactions?.delete?.(id);
    return { success: true, id };
  },
  
  // Transaction specific methods
  getTransactions: async (filters?: { 
    type?: string; 
    status?: string; 
    caseId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Transaction[]> => {
    // Use backend filtering if available
    const transactions = await api.billing?.transactions?.getAll?.(filters) || [];
    
    // Client-side filtering as fallback
    let filtered = transactions;
    
    if (filters?.type) {
      filtered = filtered.filter((t: Transaction) => t.type === filters.type);
    }
    
    if (filters?.status) {
      filtered = filtered.filter((t: Transaction) => t.status === filters.status);
    }
    
    if (filters?.caseId) {
      filtered = filtered.filter((t: Transaction) => t.caseId === filters.caseId);
    }
    
    if (filters?.startDate || filters?.endDate) {
      filtered = filtered.filter((t: Transaction) => {
        const txDate = new Date(t.date);
        const start = filters.startDate ? new Date(filters.startDate) : new Date(0);
        const end = filters.endDate ? new Date(filters.endDate) : new Date('2100-01-01');
        return txDate >= start && txDate <= end;
      });
    }
    
    // Sort by date descending
    return filtered.sort((a: Transaction, b: Transaction) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  },
  
  createTransaction: async (transaction: Partial<Transaction>): Promise<Transaction> => {
    const newTransaction: Transaction = {
      id: `tx-${Date.now()}`,
      type: transaction.type || 'expense',
      amount: transaction.amount || 0,
      currency: transaction.currency || 'USD',
      description: transaction.description || 'New Transaction',
      date: transaction.date || new Date().toISOString(),
      caseId: transaction.caseId,
      matterId: transaction.matterId,
      status: transaction.status || 'pending',
      paymentMethod: transaction.paymentMethod,
      reference: transaction.reference,
      metadata: transaction.metadata,
    };
    
    return api.billing?.transactions?.create?.(newTransaction) || newTransaction;
  },
  
  getBalance: async (caseId?: string): Promise<Balance> => {
    // Try to get balance from backend
    const backendBalance = await api.billing?.getBalance?.(caseId);
    if (backendBalance) return backendBalance;
    
    // Fallback calculation
    await delay(50);
    const transactions = await api.billing?.transactions?.getAll?.({ caseId }) || [];
    
    const balance: Balance = {
      total: 0,
      pending: 0,
      reconciled: 0,
      currency: 'USD',
    };
    
    transactions.forEach((t: Transaction) => {
      const amount = t.type === 'expense' || t.type === 'refund' ? -t.amount : t.amount;
      
      balance.total += amount;
      
      if (t.status === 'pending') {
        balance.pending += amount;
      } else if (t.status === 'reconciled') {
        balance.reconciled += amount;
      }
    });
    
    return balance;
  },
  
  reconcile: async (transactionId: string): Promise<boolean> => {
    await delay(100);
    try {
      await api.billing?.transactions?.reconcile?.(transactionId);
      console.log(`[TransactionService] Reconciled transaction: ${transactionId}`);
      return true;
    } catch {
      return false;
    }
  },
};
