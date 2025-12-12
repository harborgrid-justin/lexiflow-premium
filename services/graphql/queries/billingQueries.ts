/**
 * GraphQL Queries for Billing
 */

import { gql } from '@apollo/client';

// Fragment for time entry fields
export const TIME_ENTRY_FRAGMENT = gql`
  fragment TimeEntryFields on TimeEntry {
    id
    caseId
    case {
      id
      caseNumber
      title
    }
    userId
    user {
      id
      firstName
      lastName
    }
    activityType
    description
    date
    hours
    minutes
    totalMinutes
    rate
    amount
    isBillable
    status
    invoiceId
    notes
    createdAt
    updatedAt
  }
`;

// Fragment for invoice fields
export const INVOICE_FRAGMENT = gql`
  fragment InvoiceFields on Invoice {
    id
    invoiceNumber
    caseId
    case {
      id
      caseNumber
      title
    }
    clientId
    client {
      id
      name
      email
    }
    status
    issueDate
    dueDate
    paidDate
    subtotal
    tax
    discount
    total
    amountPaid
    amountDue
    currency
    billingPeriodStart
    billingPeriodEnd
    notes
    createdAt
    updatedAt
  }
`;

// Get time entries
export const GET_TIME_ENTRIES = gql`
  ${TIME_ENTRY_FRAGMENT}
  query GetTimeEntries($page: Int, $limit: Int, $filters: TimeEntryFiltersInput) {
    timeEntries(page: $page, limit: $limit, filters: $filters) {
      data {
        ...TimeEntryFields
      }
      total
      page
      limit
      totalHours
      totalAmount
    }
  }
`;

// Get time entry by ID
export const GET_TIME_ENTRY_BY_ID = gql`
  ${TIME_ENTRY_FRAGMENT}
  query GetTimeEntryById($id: ID!) {
    timeEntry(id: $id) {
      ...TimeEntryFields
    }
  }
`;

// Get my time entries
export const GET_MY_TIME_ENTRIES = gql`
  ${TIME_ENTRY_FRAGMENT}
  query GetMyTimeEntries($limit: Int) {
    myTimeEntries(limit: $limit) {
      ...TimeEntryFields
    }
  }
`;

// Get time entry statistics
export const GET_TIME_ENTRY_STATISTICS = gql`
  query GetTimeEntryStatistics($filters: TimeEntryFiltersInput) {
    timeEntryStatistics(filters: $filters) {
      totalEntries
      totalHours
      totalAmount
      billableHours
      billableAmount
      nonBillableHours
      byStatus {
        status
        count
        hours
        amount
      }
      byUser {
        userId
        userName
        hours
        amount
      }
    }
  }
`;

// Get invoices
export const GET_INVOICES = gql`
  ${INVOICE_FRAGMENT}
  query GetInvoices($page: Int, $limit: Int, $filters: InvoiceFiltersInput) {
    invoices(page: $page, limit: $limit, filters: $filters) {
      data {
        ...InvoiceFields
      }
      total
      page
      limit
      totalAmount
      totalPaid
      totalDue
    }
  }
`;

// Get invoice by ID
export const GET_INVOICE_BY_ID = gql`
  ${INVOICE_FRAGMENT}
  query GetInvoiceById($id: ID!) {
    invoice(id: $id) {
      ...InvoiceFields
      lineItems {
        id
        type
        description
        quantity
        rate
        amount
        date
      }
      payments {
        id
        amount
        paymentDate
        paymentMethod
        referenceNumber
        notes
      }
    }
  }
`;

// Get invoice statistics
export const GET_INVOICE_STATISTICS = gql`
  query GetInvoiceStatistics($filters: InvoiceFiltersInput) {
    invoiceStatistics(filters: $filters) {
      total
      totalAmount
      totalPaid
      totalDue
      byStatus {
        status
        count
        amount
      }
      averageDaysToPay
      overdueCount
      overdueAmount
    }
  }
`;

// Get expenses
export const GET_EXPENSES = gql`
  query GetExpenses($page: Int, $limit: Int, $filters: ExpenseFiltersInput) {
    expenses(page: $page, limit: $limit, filters: $filters) {
      data {
        id
        caseId
        case {
          id
          caseNumber
          title
        }
        userId
        user {
          id
          firstName
          lastName
        }
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
      total
      page
      limit
      totalAmount
    }
  }
`;

// Get billing analytics
export const GET_BILLING_ANALYTICS = gql`
  query GetBillingAnalytics($dateFrom: String!, $dateTo: String!) {
    billingAnalytics(dateFrom: $dateFrom, dateTo: $dateTo) {
      totalRevenue
      totalHours
      totalExpenses
      averageHourlyRate
      realization
      collectionRate
      byMonth {
        month
        revenue
        hours
        expenses
      }
      byCase {
        caseId
        caseName
        revenue
        hours
        expenses
      }
      byUser {
        userId
        userName
        revenue
        hours
      }
    }
  }
`;

// Get work in progress
export const GET_WORK_IN_PROGRESS = gql`
  query GetWorkInProgress($caseId: ID) {
    workInProgress(caseId: $caseId) {
      caseId
      caseName
      unbilledTimeEntries
      unbilledTimeAmount
      unbilledExpenses
      unbilledExpenseAmount
      totalUnbilled
      oldestEntryDate
    }
  }
`;

export default {
  GET_TIME_ENTRIES,
  GET_TIME_ENTRY_BY_ID,
  GET_MY_TIME_ENTRIES,
  GET_TIME_ENTRY_STATISTICS,
  GET_INVOICES,
  GET_INVOICE_BY_ID,
  GET_INVOICE_STATISTICS,
  GET_EXPENSES,
  GET_BILLING_ANALYTICS,
  GET_WORK_IN_PROGRESS,
};
