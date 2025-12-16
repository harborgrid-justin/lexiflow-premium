/**
 * Evidence-related enums
 * Shared between frontend and backend
 */

export enum EvidenceType {
  PHYSICAL = 'Physical',
  DIGITAL = 'Digital',
  DOCUMENT = 'Document',
  TESTIMONY = 'Testimony',
  FORENSIC = 'Forensic',
}

export enum AdmissibilityStatus {
  ADMISSIBLE = 'Admissible',
  CHALLENGED = 'Challenged',
  INADMISSIBLE = 'Inadmissible',
  PENDING = 'Pending',
}

export enum CustodyActionType {
  INITIAL_COLLECTION = 'Initial Collection',
  TRANSFER_TO_STORAGE = 'Transfer to Storage',
  TRANSFER_TO_LAB = 'Transfer to Lab',
  RETURNED_TO_CLIENT = 'Returned to Client',
  SENT_FOR_ANALYSIS = 'Sent for Analysis',
  CHECKED_OUT = 'Checked Out',
  CHECKED_IN = 'Checked In',
  DISPOSED = 'Disposed',
}
