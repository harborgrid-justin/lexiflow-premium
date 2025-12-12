/**
 * React Query Hooks for Billing API
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import * as timeEntriesService from '../../services/api/timeEntriesService';
import * as invoicesService from '../../services/api/invoicesService';
import * as expensesService from '../../services/api/expensesService';
import type { PaginationParams } from '../../types/api';

// Query Keys
export const billingKeys = {
  all: ['billing'] as const,
  timeEntries: {
    all: ['billing', 'timeEntries'] as const,
    lists: () => [...billingKeys.timeEntries.all, 'list'] as const,
    list: (filters?: any) => [...billingKeys.timeEntries.lists(), { filters }] as const,
    detail: (id: string) => [...billingKeys.timeEntries.all, 'detail', id] as const,
    statistics: (filters?: any) => [...billingKeys.timeEntries.all, 'statistics', filters] as const,
  },
  invoices: {
    all: ['billing', 'invoices'] as const,
    lists: () => [...billingKeys.invoices.all, 'list'] as const,
    list: (filters?: any) => [...billingKeys.invoices.lists(), { filters }] as const,
    detail: (id: string) => [...billingKeys.invoices.all, 'detail', id] as const,
    statistics: (filters?: any) => [...billingKeys.invoices.all, 'statistics', filters] as const,
  },
  expenses: {
    all: ['billing', 'expenses'] as const,
    lists: () => [...billingKeys.expenses.all, 'list'] as const,
    list: (filters?: any) => [...billingKeys.expenses.lists(), { filters }] as const,
    detail: (id: string) => [...billingKeys.expenses.all, 'detail', id] as const,
    statistics: (filters?: any) => [...billingKeys.expenses.all, 'statistics', filters] as const,
  },
};

// Time Entries Hooks
export function useTimeEntries(
  filters?: PaginationParams & any,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: billingKeys.timeEntries.list(filters),
    queryFn: () => timeEntriesService.getTimeEntries(filters),
    ...options,
  });
}

export function useTimeEntry(
  id: string,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: billingKeys.timeEntries.detail(id),
    queryFn: () => timeEntriesService.getTimeEntryById(id),
    enabled: !!id,
    ...options,
  });
}

export function useTimeEntryStatistics(
  filters?: any,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: billingKeys.timeEntries.statistics(filters),
    queryFn: () => timeEntriesService.getTimeEntryStatistics(filters),
    ...options,
  });
}

export function useCreateTimeEntry(
  options?: UseMutationOptions<any, Error, any>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: timeEntriesService.createTimeEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.timeEntries.lists() });
      queryClient.invalidateQueries({ queryKey: billingKeys.timeEntries.statistics() });
    },
    ...options,
  });
}

export function useUpdateTimeEntry(
  options?: UseMutationOptions<any, Error, { id: string; data: any }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => timeEntriesService.updateTimeEntry(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: billingKeys.timeEntries.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: billingKeys.timeEntries.lists() });
    },
    ...options,
  });
}

export function useDeleteTimeEntry(
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: timeEntriesService.deleteTimeEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.timeEntries.lists() });
    },
    ...options,
  });
}

export function useApproveTimeEntry(
  options?: UseMutationOptions<any, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: timeEntriesService.approveTimeEntry,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: billingKeys.timeEntries.detail(id) });
      queryClient.invalidateQueries({ queryKey: billingKeys.timeEntries.lists() });
    },
    ...options,
  });
}

// Invoices Hooks
export function useInvoices(
  filters?: PaginationParams & any,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: billingKeys.invoices.list(filters),
    queryFn: () => invoicesService.getInvoices(filters),
    ...options,
  });
}

export function useInvoice(
  id: string,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: billingKeys.invoices.detail(id),
    queryFn: () => invoicesService.getInvoiceById(id),
    enabled: !!id,
    ...options,
  });
}

export function useInvoiceStatistics(
  filters?: any,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: billingKeys.invoices.statistics(filters),
    queryFn: () => invoicesService.getInvoiceStatistics(filters),
    ...options,
  });
}

export function useCreateInvoice(
  options?: UseMutationOptions<any, Error, any>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: invoicesService.createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.invoices.lists() });
      queryClient.invalidateQueries({ queryKey: billingKeys.invoices.statistics() });
    },
    ...options,
  });
}

export function useUpdateInvoice(
  options?: UseMutationOptions<any, Error, { id: string; data: any }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => invoicesService.updateInvoice(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: billingKeys.invoices.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: billingKeys.invoices.lists() });
    },
    ...options,
  });
}

export function useSendInvoice(
  options?: UseMutationOptions<any, Error, { id: string; emails?: string[] }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, emails }) => invoicesService.sendInvoice(id, emails),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: billingKeys.invoices.detail(variables.id) });
    },
    ...options,
  });
}

export function useRecordPayment(
  options?: UseMutationOptions<any, Error, { id: string; amount: number; paymentDate: Date; paymentMethod: string }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, amount, paymentDate, paymentMethod }) =>
      invoicesService.recordPayment(id, amount, paymentDate, paymentMethod),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: billingKeys.invoices.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: billingKeys.invoices.lists() });
    },
    ...options,
  });
}

// Expenses Hooks
export function useExpenses(
  filters?: PaginationParams & any,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: billingKeys.expenses.list(filters),
    queryFn: () => expensesService.getExpenses(filters),
    ...options,
  });
}

export function useExpense(
  id: string,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: billingKeys.expenses.detail(id),
    queryFn: () => expensesService.getExpenseById(id),
    enabled: !!id,
    ...options,
  });
}

export function useCreateExpense(
  options?: UseMutationOptions<any, Error, any>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: expensesService.createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.expenses.lists() });
    },
    ...options,
  });
}

export function useUpdateExpense(
  options?: UseMutationOptions<any, Error, { id: string; data: any }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => expensesService.updateExpense(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: billingKeys.expenses.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: billingKeys.expenses.lists() });
    },
    ...options,
  });
}

export function useApproveExpense(
  options?: UseMutationOptions<any, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: expensesService.approveExpense,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: billingKeys.expenses.detail(id) });
      queryClient.invalidateQueries({ queryKey: billingKeys.expenses.lists() });
    },
    ...options,
  });
}

export default {
  // Time Entries
  useTimeEntries,
  useTimeEntry,
  useTimeEntryStatistics,
  useCreateTimeEntry,
  useUpdateTimeEntry,
  useDeleteTimeEntry,
  useApproveTimeEntry,
  // Invoices
  useInvoices,
  useInvoice,
  useInvoiceStatistics,
  useCreateInvoice,
  useUpdateInvoice,
  useSendInvoice,
  useRecordPayment,
  // Expenses
  useExpenses,
  useExpense,
  useCreateExpense,
  useUpdateExpense,
  useApproveExpense,
};
