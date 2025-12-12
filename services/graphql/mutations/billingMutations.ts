/**
 * GraphQL Mutations for Billing
 */

import { gql } from '@apollo/client';
import { TIME_ENTRY_FRAGMENT, INVOICE_FRAGMENT } from '../queries/billingQueries';

// Create time entry
export const CREATE_TIME_ENTRY = gql`
  ${TIME_ENTRY_FRAGMENT}
  mutation CreateTimeEntry($input: CreateTimeEntryInput!) {
    createTimeEntry(input: $input) {
      ...TimeEntryFields
    }
  }
`;

// Update time entry
export const UPDATE_TIME_ENTRY = gql`
  ${TIME_ENTRY_FRAGMENT}
  mutation UpdateTimeEntry($id: ID!, $input: UpdateTimeEntryInput!) {
    updateTimeEntry(id: $id, input: $input) {
      ...TimeEntryFields
    }
  }
`;

// Delete time entry
export const DELETE_TIME_ENTRY = gql`
  mutation DeleteTimeEntry($id: ID!) {
    deleteTimeEntry(id: $id) {
      success
      message
    }
  }
`;

// Submit time entry for approval
export const SUBMIT_TIME_ENTRY = gql`
  ${TIME_ENTRY_FRAGMENT}
  mutation SubmitTimeEntry($id: ID!) {
    submitTimeEntry(id: $id) {
      ...TimeEntryFields
    }
  }
`;

// Approve time entry
export const APPROVE_TIME_ENTRY = gql`
  ${TIME_ENTRY_FRAGMENT}
  mutation ApproveTimeEntry($id: ID!) {
    approveTimeEntry(id: $id) {
      ...TimeEntryFields
    }
  }
`;

// Reject time entry
export const REJECT_TIME_ENTRY = gql`
  ${TIME_ENTRY_FRAGMENT}
  mutation RejectTimeEntry($id: ID!, $reason: String!) {
    rejectTimeEntry(id: $id, reason: $reason) {
      ...TimeEntryFields
    }
  }
`;

// Bulk approve time entries
export const BULK_APPROVE_TIME_ENTRIES = gql`
  mutation BulkApproveTimeEntries($ids: [ID!]!) {
    bulkApproveTimeEntries(ids: $ids) {
      approved
      failed
      errors
    }
  }
`;

// Create invoice
export const CREATE_INVOICE = gql`
  ${INVOICE_FRAGMENT}
  mutation CreateInvoice($input: CreateInvoiceInput!) {
    createInvoice(input: $input) {
      ...InvoiceFields
    }
  }
`;

// Update invoice
export const UPDATE_INVOICE = gql`
  ${INVOICE_FRAGMENT}
  mutation UpdateInvoice($id: ID!, $input: UpdateInvoiceInput!) {
    updateInvoice(id: $id, input: $input) {
      ...InvoiceFields
    }
  }
`;

// Delete invoice
export const DELETE_INVOICE = gql`
  mutation DeleteInvoice($id: ID!) {
    deleteInvoice(id: $id) {
      success
      message
    }
  }
`;

// Send invoice
export const SEND_INVOICE = gql`
  ${INVOICE_FRAGMENT}
  mutation SendInvoice($id: ID!, $emails: [String!]) {
    sendInvoice(id: $id, emails: $emails) {
      ...InvoiceFields
    }
  }
`;

// Record payment
export const RECORD_PAYMENT = gql`
  mutation RecordPayment($invoiceId: ID!, $input: RecordPaymentInput!) {
    recordPayment(invoiceId: $invoiceId, input: $input) {
      id
      invoiceId
      amount
      paymentDate
      paymentMethod
      referenceNumber
      notes
    }
  }
`;

// Void invoice
export const VOID_INVOICE = gql`
  ${INVOICE_FRAGMENT}
  mutation VoidInvoice($id: ID!, $reason: String) {
    voidInvoice(id: $id, reason: $reason) {
      ...InvoiceFields
    }
  }
`;

// Send payment reminder
export const SEND_PAYMENT_REMINDER = gql`
  ${INVOICE_FRAGMENT}
  mutation SendPaymentReminder($id: ID!) {
    sendPaymentReminder(id: $id) {
      ...InvoiceFields
    }
  }
`;

// Create expense
export const CREATE_EXPENSE = gql`
  mutation CreateExpense($input: CreateExpenseInput!) {
    createExpense(input: $input) {
      id
      caseId
      userId
      category
      description
      amount
      date
      isBillable
      isReimbursable
      status
      receiptUrl
      vendor
      notes
      createdAt
      updatedAt
    }
  }
`;

// Update expense
export const UPDATE_EXPENSE = gql`
  mutation UpdateExpense($id: ID!, $input: UpdateExpenseInput!) {
    updateExpense(id: $id, input: $input) {
      id
      category
      description
      amount
      date
      isBillable
      isReimbursable
      status
      vendor
      notes
      updatedAt
    }
  }
`;

// Delete expense
export const DELETE_EXPENSE = gql`
  mutation DeleteExpense($id: ID!) {
    deleteExpense(id: $id) {
      success
      message
    }
  }
`;

// Approve expense
export const APPROVE_EXPENSE = gql`
  mutation ApproveExpense($id: ID!) {
    approveExpense(id: $id) {
      id
      status
      approvedBy
      approvedAt
    }
  }
`;

// Reject expense
export const REJECT_EXPENSE = gql`
  mutation RejectExpense($id: ID!, $reason: String!) {
    rejectExpense(id: $id, reason: $reason) {
      id
      status
      rejectionReason
    }
  }
`;

export default {
  CREATE_TIME_ENTRY,
  UPDATE_TIME_ENTRY,
  DELETE_TIME_ENTRY,
  SUBMIT_TIME_ENTRY,
  APPROVE_TIME_ENTRY,
  REJECT_TIME_ENTRY,
  BULK_APPROVE_TIME_ENTRIES,
  CREATE_INVOICE,
  UPDATE_INVOICE,
  DELETE_INVOICE,
  SEND_INVOICE,
  RECORD_PAYMENT,
  VOID_INVOICE,
  SEND_PAYMENT_REMINDER,
  CREATE_EXPENSE,
  UPDATE_EXPENSE,
  DELETE_EXPENSE,
  APPROVE_EXPENSE,
  REJECT_EXPENSE,
};
