import { analyticsApi, api } from '@/lib/frontend-api';
import { TransactionService } from "@/services/domain/transaction.service";
import { BillingRepository } from "../repositories/BillingRepository";
import { RepositoryRegistry } from "../repositories/RepositoryRegistry";

export const FinancialDescriptors: PropertyDescriptorMap = {
  transactions: {
    get: () => TransactionService,
    enumerable: true,
  },
  billing: {
    get: () =>
      RepositoryRegistry.getOrCreate("billing", () => new BillingRepository()),
    enumerable: true,
  },
  timeEntries: {
    get: () => api.timeEntries,
    enumerable: true,
  },
  invoices: {
    get: () => api.invoices,
    enumerable: true,
  },
  expenses: {
    get: () => api.expenses,
    enumerable: true,
  },
  feeAgreements: {
    get: () => api.feeAgreements,
    enumerable: true,
  },
  rateTables: {
    get: () => api.rateTables,
    enumerable: true,
  },
  trustAccounts: {
    get: () => api.trustAccounts,
    enumerable: true,
  },
  billingAnalytics: {
    get: () => analyticsApi.billingAnalytics,
    enumerable: true,
  },
};
