/**
 * Discovery-related enums
 * Shared between frontend and backend
 */

export enum DiscoveryType {
  PRODUCTION = 'Production',
  INTERROGATORY = 'Interrogatory',
  ADMISSION = 'Admission',
  DEPOSITION = 'Deposition',
}

export enum DiscoveryStatus {
  DRAFT = 'Draft',
  SERVED = 'Served',
  RESPONDED = 'Responded',
  OVERDUE = 'Overdue',
  CLOSED = 'Closed',
  MOTION_FILED = 'Motion Filed',
}

export enum DiscoveryRequestStatus {
  SERVED = 'Served',
  PENDING = 'Pending',
  RESPONDED = 'Responded',
  OVERDUE = 'Overdue',
}

export enum ESICollectionStatus {
  PENDING = 'Pending',
  COLLECTING = 'Collecting',
  COLLECTED = 'Collected',
  PROCESSING = 'Processing',
  PROCESSED = 'Processed',
  PRODUCED = 'Produced',
  ERROR = 'Error',
}

export enum LegalHoldStatus {
  PENDING = 'Pending',
  ACKNOWLEDGED = 'Acknowledged',
  REMINDER_SENT = 'Reminder Sent',
  RELEASED = 'Released',
}

export enum PrivilegeBasis {
  ATTORNEY_CLIENT = 'Attorney-Client',
  WORK_PRODUCT = 'Work Product',
  JOINT_DEFENSE = 'Joint Defense',
  COMMON_INTEREST = 'Common Interest',
}

export enum ConferralResult {
  AGREED = 'Agreed',
  IMPASSE = 'Impasse',
  PARTIAL_AGREEMENT = 'Partial Agreement',
  PENDING = 'Pending',
}

export enum ConferralMethod {
  EMAIL = 'Email',
  PHONE = 'Phone',
  IN_PERSON = 'In-Person',
  VIDEO_CONFERENCE = 'Video Conference',
}
