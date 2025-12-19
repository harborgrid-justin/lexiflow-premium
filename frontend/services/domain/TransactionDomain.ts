/**
 * TransactionDomain - Placeholder implementation
 * TODO: Implement full domain service
 */

// Placeholder service - returns empty arrays/objects for compatibility
export const TransactionService = {
  getAll: async () => [],
  getById: async (id: string) => null,
  add: async (item: any) => item,
  update: async (id: string, updates: any) => updates,
  delete: async (id: string) => true,
  
  // Transaction specific methods
  getTransactions: async (filters?: any) => [],
  createTransaction: async (transaction: any) => transaction,
  getBalance: async () => ({ total: 0, pending: 0 }),
  reconcile: async (transactionId: string) => true,
};
