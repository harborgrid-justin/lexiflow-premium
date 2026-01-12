// Types
import { Invoice } from '@/types';
import { DataService } from '@/services/data/dataService';
import { billingQueryKeys } from '@/services/infrastructure/queryKeys';
import { InvoiceStatusEnum } from '@/types/enums';
import { queryClient, useMutation, useQuery } from '@/hooks/useQueryHooks';
import { useNotify } from '@/hooks/useNotify';
import { useMemo, useState } from 'react';

interface MutationContext {
  previousInvoices?: Invoice[];
}

export function useBillingInvoices() {
  const notify = useNotify();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Enterprise Data Access with query keys
  const { data: invoices = [] } = useQuery<Invoice[]>(
    billingQueryKeys.billing.invoices(),
    () => (DataService && DataService.billing) ? DataService.billing.getInvoices() : Promise.resolve([])
  );

  const { mutate: sendInvoice } = useMutation(
    (id: string) => (DataService && DataService.billing) ? DataService.billing.sendInvoice(id) : Promise.resolve(false),
    {
      onMutate: async (id: string) => {
        const previousInvoices = queryClient.getQueryState<Invoice[]>(billingQueryKeys.billing.invoices())?.data;
        queryClient.setQueryData<Invoice[]>(
          billingQueryKeys.billing.invoices(),
          (old = []) => old.map(inv =>
            inv.id === id ? { ...inv, status: InvoiceStatusEnum.SENT } : inv
          )
        );
        return { previousInvoices };
      },
      onSuccess: (_, id) => {
        notify.success(`Invoice ${id} sent successfully.`);
      },
      onError: (_, __, context?: MutationContext) => {
        if (context?.previousInvoices) {
          queryClient.setQueryData(billingQueryKeys.billing.invoices(), context.previousInvoices);
        }
        notify.error('Failed to send invoice');
      },
      onSettled: () => {
        queryClient.invalidate(billingQueryKeys.billing.invoices());
      }
    }
  );

  const { mutate: markPaid } = useMutation(
    (id: string) => DataService.billing.updateInvoice(id, { status: InvoiceStatusEnum.PAID }),
    {
      onMutate: async (id: string) => {
        const previousInvoices = queryClient.getQueryState<Invoice[]>(billingQueryKeys.billing.invoices())?.data;
        queryClient.setQueryData<Invoice[]>(
          billingQueryKeys.billing.invoices(),
          (old = []) => old.map(inv =>
            inv.id === id ? { ...inv, status: InvoiceStatusEnum.PAID } : inv
          )
        );
        return { previousInvoices };
      },
      onSuccess: () => {
        notify.success("Invoice marked as PAID. Transaction recorded in immutable ledger.");
      },
      onError: (_, __, context?: MutationContext) => {
        if (context?.previousInvoices) {
          queryClient.setQueryData(billingQueryKeys.billing.invoices(), context.previousInvoices);
        }
        notify.error("Failed to update invoice.");
      },
      onSettled: () => {
        queryClient.invalidate(billingQueryKeys.billing.invoices());
      }
    }
  );

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchesSearch = (inv.client || '').toLowerCase().includes(searchTerm.toLowerCase()) || inv.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'All' || inv.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchTerm, filterStatus]);

  return {
    invoices,
    filteredInvoices,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    sendInvoice,
    markPaid
  };
}
