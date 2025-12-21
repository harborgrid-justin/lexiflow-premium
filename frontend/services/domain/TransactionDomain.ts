/**
 * TransactionDomain - Financial transaction management service
 * Provides transaction tracking, balance calculation, and reconciliation
 */

import { db, STORES } from '../data/db';
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
  getAll: async () => db.getAll(STORES.TRANSACTIONS),
  getById: async (id: string) => db.get(STORES.TRANSACTIONS, id),
  add: async (item: any) => db.put(STORES.TRANSACTIONS, { 
    ...item, 
    createdAt: new Date().toISOString(),
    status: item.status || 'pending'
  }),
  update: async (id: string, updates: any) => {
    const existing = await db.get(STORES.TRANSACTIONS, id);
    return db.put(STORES.TRANSACTIONS, { ...existing, ...updates });
  },
  delete: async (id: string) => db.delete(STORES.TRANSACTIONS, id),
  
  // Transaction specific methods
  getTransactions: async (filters?: { 
    type?: string; 
    status?: string; 
    caseId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Transaction[]> => {
    let transactions = await db.getAll(STORES.TRANSACTIONS);
    
    if (filters?.type) {
      transactions = transactions.filter((t: Transaction) => t.type === filters.type);
    }
    
    if (filters?.status) {
      transactions = transactions.filter((t: Transaction) => t.status === filters.status);
    }
    
    if (filters?.caseId) {
      transactions = transactions.filter((t: Transaction) => t.caseId === filters.caseId);
    }
    
    if (filters?.startDate || filters?.endDate) {
      transactions = transactions.filter((t: Transaction) => {
        const txDate = new Date(t.date);
        const start = filters.startDate ? new Date(filters.startDate) : new Date(0);
        const end = filters.endDate ? new Date(filters.endDate) : new Date('2100-01-01');
        return txDate >= start && txDate <= end;
      });
    }
    
    // Sort by date descending
    return transactions.sort((a: Transaction, b: Transaction) => 
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
    
    await db.put(STORES.TRANSACTIONS, newTransaction);
    return newTransaction;
  },
  
  getBalance: async (caseId?: string): Promise<Balance> => {
    await delay(50);
    const transactions = caseId 
      ? (await db.getAll(STORES.TRANSACTIONS)).filter((t: Transaction) => t.caseId === caseId)
      : await db.getAll(STORES.TRANSACTIONS);
    
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
      const transaction = await db.get(STORES.TRANSACTIONS, transactionId);
      if (!transaction) return false;
      
      await db.put(STORES.TRANSACTIONS, {
        ...transaction,
        status: 'reconciled',
        reconciledAt: new Date().toISOString(),
      });
      
      console.log(`[TransactionService] Reconciled transaction: ${transactionId}`);
      return true;
    } catch {
      return false;
    }
  },
};
