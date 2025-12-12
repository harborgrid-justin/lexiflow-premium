import { gql } from '@apollo/client';

// Case subscriptions
export const CASE_CREATED_SUBSCRIPTION = gql`
  subscription OnCaseCreated {
    caseCreated {
      id
      caseNumber
      title
      type
      status
      createdAt
      createdBy {
        id
        fullName
      }
    }
  }
`;

export const CASE_UPDATED_SUBSCRIPTION = gql`
  subscription OnCaseUpdated($caseId: ID) {
    caseUpdated(caseId: $caseId) {
      id
      caseNumber
      title
      type
      status
      updatedAt
    }
  }
`;

export const CASE_DELETED_SUBSCRIPTION = gql`
  subscription OnCaseDeleted {
    caseDeleted
  }
`;

// Document subscriptions
export const DOCUMENT_CREATED_SUBSCRIPTION = gql`
  subscription OnDocumentCreated($caseId: ID) {
    documentCreated(caseId: $caseId) {
      id
      title
      documentType
      status
      fileName
      createdAt
      createdBy {
        id
        fullName
      }
    }
  }
`;

export const DOCUMENT_UPDATED_SUBSCRIPTION = gql`
  subscription OnDocumentUpdated($documentId: ID, $caseId: ID) {
    documentUpdated(documentId: $documentId, caseId: $caseId) {
      id
      title
      status
      ocrProcessed
      updatedAt
    }
  }
`;

export const DOCUMENT_PROCESSED_SUBSCRIPTION = gql`
  subscription OnDocumentProcessed($documentId: ID) {
    documentProcessed(documentId: $documentId) {
      id
      title
      ocrProcessed
      extractedText
      updatedAt
    }
  }
`;

// Billing subscriptions
export const TIME_ENTRY_CREATED_SUBSCRIPTION = gql`
  subscription OnTimeEntryCreated($caseId: ID) {
    timeEntryCreated(caseId: $caseId) {
      id
      description
      hours
      rate
      amount
      status
      user {
        id
        fullName
      }
      createdAt
    }
  }
`;

export const INVOICE_CREATED_SUBSCRIPTION = gql`
  subscription OnInvoiceCreated {
    invoiceCreated {
      id
      invoiceNumber
      status
      total
      dueDate
      createdAt
    }
  }
`;

export const INVOICE_UPDATED_SUBSCRIPTION = gql`
  subscription OnInvoiceUpdated($invoiceId: ID) {
    invoiceUpdated(invoiceId: $invoiceId) {
      id
      invoiceNumber
      status
      total
      paidDate
      updatedAt
    }
  }
`;

export const INVOICE_PAID_SUBSCRIPTION = gql`
  subscription OnInvoicePaid {
    invoicePaid {
      id
      invoiceNumber
      total
      paidDate
    }
  }
`;

// Notification subscriptions
export const NOTIFICATION_SUBSCRIPTION = gql`
  subscription OnNotification {
    notificationSent {
      id
      type
      title
      message
      link
      createdAt
      userId
    }
  }
`;

// Chat subscriptions
export const CHAT_MESSAGE_SUBSCRIPTION = gql`
  subscription OnChatMessage($caseId: ID!) {
    chatMessage(caseId: $caseId) {
      id
      caseId
      content
      userId
      userName
      createdAt
    }
  }
`;

// Task subscriptions
export const TASK_ASSIGNED_SUBSCRIPTION = gql`
  subscription OnTaskAssigned {
    taskAssigned {
      id
      taskId
      taskTitle
      assignedToId
      assignedById
      dueDate
      createdAt
    }
  }
`;

// Deadline subscriptions
export const DEADLINE_REMINDER_SUBSCRIPTION = gql`
  subscription OnDeadlineReminder {
    deadlineReminder {
      id
      caseId
      caseNumber
      description
      deadline
      hoursRemaining
    }
  }
`;
