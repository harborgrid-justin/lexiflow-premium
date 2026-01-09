import { analyticsApi, api, isBackendApiEnabled } from "@/api";
import { repositoryRegistry as legacyRepositoryRegistry } from "@/services/core/RepositoryFactory";
import { TransactionService } from "@/services/domain/TransactionDomain";
import { STORES } from "../db";
import { getIntegratedBillingRepository } from "../factories/RepositoryFactories";

export const FinancialDescriptors: PropertyDescriptorMap = {
  transactions: {
    get: () => TransactionService,
    enumerable: true,
  },
  billing: {
    get: () =>
      isBackendApiEnabled() ? api.billing : getIntegratedBillingRepository(),
    enumerable: true,
  },
  timeEntries: {
    get: () =>
      isBackendApiEnabled()
        ? api.timeEntries
        : legacyRepositoryRegistry.getOrCreate(STORES.BILLING),
    enumerable: true,
  },
  invoices: {
    get: () =>
      isBackendApiEnabled()
        ? api.invoices
        : legacyRepositoryRegistry.getOrCreate("invoices"),
    enumerable: true,
  },
  expenses: {
    get: () =>
      isBackendApiEnabled()
        ? api.expenses
        : legacyRepositoryRegistry.getOrCreate(STORES.EXPENSES),
    enumerable: true,
  },
  feeAgreements: {
    get: () =>
      isBackendApiEnabled()
        ? api.feeAgreements
        : legacyRepositoryRegistry.getOrCreate("feeAgreements"),
    enumerable: true,
  },
  rateTables: {
    get: () =>
      isBackendApiEnabled()
        ? api.rateTables
        : legacyRepositoryRegistry.getOrCreate("rateTables"),
    enumerable: true,
  },
  trustAccounts: {
    get: () =>
      isBackendApiEnabled()
        ? api.trustAccounts
        : legacyRepositoryRegistry.getOrCreate("trustAccounts"),
    enumerable: true,
  },
  billingAnalytics: {
    get: () =>
      isBackendApiEnabled()
        ? analyticsApi.billingAnalytics
        : legacyRepositoryRegistry.getOrCreate("billingAnalytics"),
    enumerable: true,
  },
};
