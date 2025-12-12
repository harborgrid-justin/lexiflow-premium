import { gql } from '@apollo/client';

export const TIME_ENTRY_FRAGMENT = gql`
  fragment TimeEntryFields on TimeEntryType {
    id
    description
    hours
    rate
    amount
    status
    entryDate
    caseId
    taskCode
    activityCode
    billable
    createdAt
    updatedAt
    user {
      id
      fullName
      email
    }
  }
`;

export const INVOICE_FRAGMENT = gql`
  fragment InvoiceFields on InvoiceType {
    id
    invoiceNumber
    status
    subtotal
    tax
    total
    discount
    invoiceDate
    dueDate
    paidDate
    caseId
    clientId
    notes
    createdAt
    updatedAt
    createdBy {
      id
      fullName
      email
    }
  }
`;

export const GET_TIME_ENTRIES = gql`
  ${TIME_ENTRY_FRAGMENT}
  query GetTimeEntries($filter: TimeEntryFilterInput, $pagination: PaginationInput) {
    timeEntries(filter: $filter, pagination: $pagination) {
      ...TimeEntryFields
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

export const CREATE_TIME_ENTRY = gql`
  ${TIME_ENTRY_FRAGMENT}
  mutation CreateTimeEntry($input: CreateTimeEntryInput!) {
    createTimeEntry(input: $input) {
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

export const DELETE_TIME_ENTRY = gql`
  mutation DeleteTimeEntry($id: ID!) {
    deleteTimeEntry(id: $id)
  }
`;

export const SUBMIT_TIME_ENTRIES = gql`
  mutation SubmitTimeEntries($ids: [ID!]!) {
    submitTimeEntries(ids: $ids)
  }
`;

export const APPROVE_TIME_ENTRIES = gql`
  mutation ApproveTimeEntries($ids: [ID!]!) {
    approveTimeEntries(ids: $ids)
  }
`;

export const GET_INVOICES = gql`
  ${INVOICE_FRAGMENT}
  query GetInvoices($filter: InvoiceFilterInput, $pagination: PaginationInput) {
    invoices(filter: $filter, pagination: $pagination) {
      ...InvoiceFields
    }
  }
`;

export const GET_INVOICE = gql`
  ${INVOICE_FRAGMENT}
  query GetInvoice($id: ID!) {
    invoice(id: $id) {
      ...InvoiceFields
      lineItems {
        id
        description
        quantity
        rate
        amount
        timeEntryId
      }
    }
  }
`;

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
  mutation SendInvoice($id: ID!) {
    sendInvoice(id: $id) {
      ...InvoiceFields
    }
  }
`;

export const MARK_INVOICE_PAID = gql`
  ${INVOICE_FRAGMENT}
  mutation MarkInvoicePaid($id: ID!, $paidDate: DateTime!) {
    markInvoicePaid(id: $id, paidDate: $paidDate) {
      ...InvoiceFields
    }
  }
`;

export const GET_RATE_TABLES = gql`
  query GetRateTables {
    rateTables {
      id
      name
      role
      rate
      effectiveDate
      expirationDate
      createdAt
    }
  }
`;

export const GET_FEE_AGREEMENTS = gql`
  query GetFeeAgreements($caseId: ID) {
    feeAgreements(caseId: $caseId) {
      id
      type
      rate
      percentage
      flatFee
      retainer
      effectiveDate
      expirationDate
      terms
      createdAt
    }
  }
`;
