import { gql } from 'graphql-tag';

// Time Entry Fragments
export const TIME_ENTRY_FRAGMENT = gql`
  fragment TimeEntryFields on TimeEntry {
    id
    caseId
    userId
    date
    duration
    description
    activity
    ledesCode
    rate
    total
    status
    billable
    invoiceId
    rateTableId
    internalNotes
    taskCode
    discount
    discountedTotal
    approvedBy
    approvedAt
    billedBy
    billedAt
    phaseCode
    expenseCategory
    createdAt
    updatedAt
  }
`;

// Invoice Fragments
export const INVOICE_FRAGMENT = gql`
  fragment InvoiceFields on Invoice {
    id
    invoiceNumber
    caseId
    clientId
    clientName
    invoiceDate
    dueDate
    status
    subtotal
    taxRate
    taxAmount
    discountAmount
    totalAmount
    paidAmount
    balanceDue
    paymentTerms
    notes
    billingAddress
    pdfUrl
    sentAt
    sentBy
    paidAt
    paymentMethod
    paymentReference
    createdAt
    updatedAt
  }
`;

export const INVOICE_ITEM_FRAGMENT = gql`
  fragment InvoiceItemFields on InvoiceItem {
    id
    invoiceId
    date
    description
    quantity
    rate
    amount
    type
    timeEntryId
    expenseId
  }
`;

// Trust Account Fragments
export const TRUST_ACCOUNT_FRAGMENT = gql`
  fragment TrustAccountFields on TrustAccount {
    id
    accountNumber
    accountName
    accountType
    clientId
    clientName
    caseId
    balance
    currency
    status
    bankName
    bankAccountNumber
    routingNumber
    purpose
    openedDate
    closedDate
    minimumBalance
    interestBearing
    notes
    responsibleAttorney
    createdAt
    updatedAt
  }
`;

export const TRUST_TRANSACTION_FRAGMENT = gql`
  fragment TrustTransactionFields on TrustTransaction {
    id
    trustAccountId
    transactionType
    transactionDate
    amount
    balanceAfter
    description
    referenceNumber
    checkNumber
    payee
    payor
    paymentMethod
    relatedInvoiceId
    relatedCaseId
    approvedBy
    approvedAt
    reconciled
    reconciledDate
    notes
    attachments
    createdAt
    updatedAt
  }
`;

// Time Entry Queries
export const GET_TIME_ENTRIES = gql`
  ${TIME_ENTRY_FRAGMENT}
  query GetTimeEntries($filter: TimeEntryFilterInput) {
    timeEntries(filter: $filter) {
      data {
        ...TimeEntryFields
      }
      total
    }
  }
`;

export const GET_TIME_ENTRY = gql`
  ${TIME_ENTRY_FRAGMENT}
  query GetTimeEntry($id: ID!) {
    timeEntry(id: $id) {
      ...TimeEntryFields
    }
  }
`;

export const GET_TIME_ENTRIES_BY_CASE = gql`
  ${TIME_ENTRY_FRAGMENT}
  query GetTimeEntriesByCase($caseId: ID!) {
    timeEntriesByCase(caseId: $caseId) {
      ...TimeEntryFields
    }
  }
`;

export const GET_UNBILLED_TIME_ENTRIES = gql`
  ${TIME_ENTRY_FRAGMENT}
  query GetUnbilledTimeEntries($caseId: ID!) {
    unbilledTimeEntries(caseId: $caseId) {
      ...TimeEntryFields
    }
  }
`;

export const GET_TIME_ENTRY_TOTALS = gql`
  query GetTimeEntryTotals($caseId: ID!, $startDate: String, $endDate: String) {
    timeEntryTotals(caseId: $caseId, startDate: $startDate, endDate: $endDate) {
      total
      billable
      billed
      unbilled
    }
  }
`;

// Time Entry Mutations
export const CREATE_TIME_ENTRY = gql`
  ${TIME_ENTRY_FRAGMENT}
  mutation CreateTimeEntry($input: CreateTimeEntryInput!) {
    createTimeEntry(input: $input) {
      ...TimeEntryFields
    }
  }
`;

export const BULK_CREATE_TIME_ENTRIES = gql`
  ${TIME_ENTRY_FRAGMENT}
  mutation BulkCreateTimeEntries($entries: [CreateTimeEntryInput!]!) {
    bulkCreateTimeEntries(entries: $entries) {
      ...TimeEntryFields
    }
  }
`;

export const UPDATE_TIME_ENTRY = gql`
  ${TIME_ENTRY_FRAGMENT}
  mutation UpdateTimeEntry($id: ID!, $input: UpdateTimeEntryInput!) {
    updateTimeEntry(id: $id, input: $input) {
      ...TimeEntryFields
    }
  }
`;

export const APPROVE_TIME_ENTRY = gql`
  ${TIME_ENTRY_FRAGMENT}
  mutation ApproveTimeEntry($id: ID!, $approvedBy: ID!) {
    approveTimeEntry(id: $id, approvedBy: $approvedBy) {
      ...TimeEntryFields
    }
  }
`;

export const DELETE_TIME_ENTRY = gql`
  mutation DeleteTimeEntry($id: ID!) {
    deleteTimeEntry(id: $id)
  }
`;

// Invoice Queries
export const GET_INVOICES = gql`
  ${INVOICE_FRAGMENT}
  query GetInvoices($filter: InvoiceFilterInput) {
    invoices(filter: $filter) {
      data {
        ...InvoiceFields
      }
      total
    }
  }
`;

export const GET_INVOICE = gql`
  ${INVOICE_FRAGMENT}
  ${INVOICE_ITEM_FRAGMENT}
  query GetInvoice($id: ID!) {
    invoice(id: $id) {
      ...InvoiceFields
      items {
        ...InvoiceItemFields
      }
    }
  }
`;

export const GET_OVERDUE_INVOICES = gql`
  ${INVOICE_FRAGMENT}
  query GetOverdueInvoices {
    overdueInvoices {
      ...InvoiceFields
    }
  }
`;

export const GET_AR_AGING_REPORT = gql`
  query GetARAgingReport {
    arAgingReport {
      current
      days30
      days60
      days90
      over90
      total
    }
  }
`;

// Invoice Mutations
export const CREATE_INVOICE = gql`
  ${INVOICE_FRAGMENT}
  mutation CreateInvoice($input: CreateInvoiceInput!) {
    createInvoice(input: $input) {
      ...InvoiceFields
    }
  }
`;

export const UPDATE_INVOICE = gql`
  ${INVOICE_FRAGMENT}
  mutation UpdateInvoice($id: ID!, $input: UpdateInvoiceInput!) {
    updateInvoice(id: $id, input: $input) {
      ...InvoiceFields
    }
  }
`;

export const SEND_INVOICE = gql`
  ${INVOICE_FRAGMENT}
  mutation SendInvoice($id: ID!, $sentBy: ID!) {
    sendInvoice(id: $id, sentBy: $sentBy) {
      ...InvoiceFields
    }
  }
`;

export const RECORD_PAYMENT = gql`
  ${INVOICE_FRAGMENT}
  mutation RecordPayment($id: ID!, $input: RecordPaymentInput!) {
    recordPayment(id: $id, input: $input) {
      ...InvoiceFields
    }
  }
`;

export const GENERATE_INVOICE_PDF = gql`
  mutation GenerateInvoicePDF($id: ID!) {
    generateInvoicePDF(id: $id) {
      url
    }
  }
`;

export const DELETE_INVOICE = gql`
  mutation DeleteInvoice($id: ID!) {
    deleteInvoice(id: $id)
  }
`;

// Trust Account Queries
export const GET_TRUST_ACCOUNTS = gql`
  ${TRUST_ACCOUNT_FRAGMENT}
  query GetTrustAccounts($clientId: ID, $status: TrustAccountStatus) {
    trustAccounts(clientId: $clientId, status: $status) {
      ...TrustAccountFields
    }
  }
`;

export const GET_TRUST_ACCOUNT = gql`
  ${TRUST_ACCOUNT_FRAGMENT}
  query GetTrustAccount($id: ID!) {
    trustAccount(id: $id) {
      ...TrustAccountFields
    }
  }
`;

export const GET_TRUST_TRANSACTIONS = gql`
  ${TRUST_TRANSACTION_FRAGMENT}
  query GetTrustTransactions($accountId: ID!, $startDate: String, $endDate: String) {
    trustTransactions(accountId: $accountId, startDate: $startDate, endDate: $endDate) {
      ...TrustTransactionFields
    }
  }
`;

export const GET_LOW_BALANCE_ACCOUNTS = gql`
  ${TRUST_ACCOUNT_FRAGMENT}
  query GetLowBalanceAccounts($threshold: Float) {
    lowBalanceAccounts(threshold: $threshold) {
      ...TrustAccountFields
    }
  }
`;

// Trust Account Mutations
export const CREATE_TRUST_ACCOUNT = gql`
  ${TRUST_ACCOUNT_FRAGMENT}
  mutation CreateTrustAccount($input: CreateTrustAccountInput!) {
    createTrustAccount(input: $input) {
      ...TrustAccountFields
    }
  }
`;

export const UPDATE_TRUST_ACCOUNT = gql`
  ${TRUST_ACCOUNT_FRAGMENT}
  mutation UpdateTrustAccount($id: ID!, $input: UpdateTrustAccountInput!) {
    updateTrustAccount(id: $id, input: $input) {
      ...TrustAccountFields
    }
  }
`;

export const DEPOSIT_TO_TRUST = gql`
  ${TRUST_TRANSACTION_FRAGMENT}
  mutation DepositToTrust($accountId: ID!, $input: DepositInput!) {
    depositToTrust(accountId: $accountId, input: $input) {
      ...TrustTransactionFields
    }
  }
`;

export const WITHDRAW_FROM_TRUST = gql`
  ${TRUST_TRANSACTION_FRAGMENT}
  mutation WithdrawFromTrust($accountId: ID!, $input: WithdrawalInput!) {
    withdrawFromTrust(accountId: $accountId, input: $input) {
      ...TrustTransactionFields
    }
  }
`;

export const DELETE_TRUST_ACCOUNT = gql`
  mutation DeleteTrustAccount($id: ID!) {
    deleteTrustAccount(id: $id)
  }
`;

// Billing Analytics Queries
export const GET_BILLING_METRICS = gql`
  query GetBillingMetrics($startDate: String, $endDate: String) {
    billingMetrics(startDate: $startDate, endDate: $endDate) {
      totalRevenue
      totalBilled
      totalPaid
      outstandingAR
      averageCollectionTime
      realizationRate
      utilizationRate
    }
  }
`;

export const GET_REVENUE_BY_PRACTICE_AREA = gql`
  query GetRevenueByPracticeArea($startDate: String, $endDate: String) {
    revenueByPracticeArea(startDate: $startDate, endDate: $endDate) {
      practiceArea
      revenue
      percentage
    }
  }
`;

export const GET_ATTORNEY_PRODUCTIVITY = gql`
  query GetAttorneyProductivity($startDate: String, $endDate: String) {
    attorneyProductivity(startDate: $startDate, endDate: $endDate) {
      userId
      userName
      billableHours
      nonBillableHours
      totalRevenue
      averageRate
      utilizationRate
    }
  }
`;
