/**
 * @module services/validation/schemas/invoice-schema
 * @description Invoice validation schema
 * Encapsulates all business logic for validating invoices with line items
 * 
 * @responsibility Validate invoice data with financial integrity checks
 */

import { InvoiceStatusEnum } from '@/types/enums';
import type { CaseId } from '@/types';
import { 
  isValidDate, 
  isValidDateRange, 
  isValidStringLength, 
  isValidInvoiceNumber,
  isValidEnum 
} from '../validators/common-validators';
import { 
  isValidAmount, 
  isValidRate,
  validateLineItemCalculation,
  validateInvoiceTotal,
  FINANCIAL_CONSTRAINTS 
} from '../validators/financial-validators';
import { sanitizeString } from '../sanitizers/input-sanitizer';

/**
 * Invoice line item interface
 */
export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

/**
 * Invoice input interface
 */
export interface InvoiceInput {
  id?: string;
  caseId: CaseId;
  clientId: string;
  invoiceNumber?: string;
  date: string;
  dueDate: string;
  amount: number;
  tax?: number;
  discount?: number;
  status: string;
  items?: InvoiceItem[];
  notes?: string;
  billingAddress?: string;
}

/**
 * Invoice validation result
 */
export interface InvoiceValidationResult {
  valid: boolean;
  errors: string[];
  sanitized?: InvoiceInput;
}

/**
 * Validate invoice with financial integrity checks
 * 
 * @param invoice - Invoice to validate
 * @returns Validation result with errors and sanitized data
 * 
 * @example
 * ```ts
 * const result = validateInvoiceSafe({
 *   caseId: 'case-123',
 *   clientId: 'client-456',
 *   date: '2024-01-15',
 *   dueDate: '2024-02-15',
 *   amount: 1500.00,
 *   status: 'draft',
 *   items: [
 *     { description: 'Legal services', quantity: 10, rate: 150, amount: 1500 }
 *   ]
 * });
 * 
 * if (result.valid) {
 *   await saveInvoice(result.sanitized);
 * } else {
 *   console.error(result.errors);
 * }
 * ```
 */
export function validateInvoiceSafe(invoice: InvoiceInput): InvoiceValidationResult {
  const errors: string[] = [];
  
  try {
    // Required fields
    if (!invoice.caseId || typeof invoice.caseId !== 'string') {
      errors.push('Valid case ID is required');
    }
    
    if (!invoice.clientId || typeof invoice.clientId !== 'string') {
      errors.push('Valid client ID is required');
    }
    
    if (!invoice.date || !isValidDate(invoice.date)) {
      errors.push('Valid invoice date is required');
    }
    
    if (!invoice.dueDate || !isValidDate(invoice.dueDate)) {
      errors.push('Valid due date is required');
    }
    
    // Due date must be after invoice date
    if (invoice.date && invoice.dueDate && !isValidDateRange(invoice.date, invoice.dueDate)) {
      errors.push('Due date must be after invoice date');
    }
    
    // Amount validation
    if (!isValidAmount(invoice.amount)) {
      errors.push('Invoice amount must be a positive number with max 2 decimal places');
    }
    
    if (invoice.amount > FINANCIAL_CONSTRAINTS.MAX_INVOICE_AMOUNT) {
      errors.push(`Invoice amount cannot exceed $${FINANCIAL_CONSTRAINTS.MAX_INVOICE_AMOUNT.toLocaleString()}`);
    }
    
    // Tax validation
    if (invoice.tax !== undefined && !isValidAmount(invoice.tax)) {
      errors.push('Tax must be a valid amount with max 2 decimal places');
    }
    
    // Discount validation
    if (invoice.discount !== undefined) {
      if (!isValidAmount(invoice.discount)) {
        errors.push('Discount must be a valid amount with max 2 decimal places');
      }
      if (invoice.discount > invoice.amount) {
        errors.push('Discount cannot exceed invoice amount');
      }
    }
    
    // Status validation
    if (!isValidEnum(invoice.status, Object.values(InvoiceStatusEnum))) {
      errors.push(`Invalid status. Must be one of: ${Object.values(InvoiceStatusEnum).join(', ')}`);
    }
    
    // Invoice number format (if provided)
    if (invoice.invoiceNumber && !isValidInvoiceNumber(invoice.invoiceNumber)) {
      errors.push('Invoice number must be in format INV-XXXXXX');
    }
    
    // Line items validation
    if (invoice.items) {
      if (invoice.items.length === 0) {
        errors.push('Invoice must have at least one line item');
      }
      
      let calculatedTotal = 0;
      invoice.items.forEach((item, index) => {
        if (!isValidStringLength(item.description, 5)) {
          errors.push(`Item ${index + 1}: Description must be at least 5 characters`);
        }
        if (item.quantity <= 0 || !Number.isFinite(item.quantity)) {
          errors.push(`Item ${index + 1}: Invalid quantity`);
        }
        if (!isValidRate(item.rate)) {
          errors.push(`Item ${index + 1}: Invalid rate`);
        }
        if (!isValidAmount(item.amount)) {
          errors.push(`Item ${index + 1}: Invalid amount`);
        }
        
        // Verify amount = quantity * rate
        if (!validateLineItemCalculation(item.quantity, item.rate, item.amount)) {
          const expected = (item.quantity * item.rate).toFixed(2);
          errors.push(`Item ${index + 1}: Amount mismatch (expected ${expected})`);
        }
        
        calculatedTotal += item.amount;
      });
      
      // Verify total matches sum of items
      if (!validateInvoiceTotal(calculatedTotal, invoice.amount, invoice.tax, invoice.discount)) {
        errors.push('Invoice total does not match sum of line items');
      }
    }
    
    if (errors.length > 0) {
      return { valid: false, errors };
    }
    
    // Sanitize inputs
    const sanitized: InvoiceInput = {
      ...invoice,
      notes: invoice.notes ? sanitizeString(invoice.notes) : undefined,
      billingAddress: invoice.billingAddress ? sanitizeString(invoice.billingAddress) : undefined,
      items: invoice.items?.map(item => ({
        ...item,
        description: sanitizeString(item.description)
      }))
    };
    
    return { valid: true, errors: [], sanitized };
    
  } catch (error) {
    return { 
      valid: false, 
      errors: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`] 
    };
  }
}
