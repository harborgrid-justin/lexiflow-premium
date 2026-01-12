import { InvoiceStatusEnum } from '@/types/enums';

export const getInvoiceBadgeVariant = (status: string) => {
  if (status === InvoiceStatusEnum.PAID) return 'success';
  if (status === InvoiceStatusEnum.OVERDUE) return 'error';
  if (status === InvoiceStatusEnum.DRAFT) return 'neutral';
  return 'info';
};
