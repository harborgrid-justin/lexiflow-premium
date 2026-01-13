/**
 * Litigation-related enums
 * Shared between frontend and backend
 */

export enum MotionType {
  DISMISS = 'Dismiss',
  SUMMARY_JUDGMENT = 'Summary Judgment',
  COMPEL_DISCOVERY = 'Compel Discovery',
  IN_LIMINE = 'In Limine',
  CONTINUANCE = 'Continuance',
  SANCTIONS = 'Sanctions',
  PROTECTIVE_ORDER = 'Protective Order',
  STRIKE = 'Strike',
}

export enum MotionStatus {
  DRAFT = 'Draft',
  FILED = 'Filed',
  OPPOSITION_SERVED = 'Opposition Served',
  REPLY_SERVED = 'Reply Served',
  HEARING_SET = 'Hearing Set',
  SUBMITTED = 'Submitted',
  DECIDED = 'Decided',
  WITHDRAWN = 'Withdrawn',
}

export enum MotionOutcome {
  GRANTED = 'Granted',
  DENIED = 'Denied',
  WITHDRAWN = 'Withdrawn',
  MOOT = 'Moot',
  PARTIALLY_GRANTED = 'Partially Granted',
}

export enum DocketEntryType {
  FILING = 'Filing',
  ORDER = 'Order',
  NOTICE = 'Notice',
  MINUTE_ENTRY = 'Minute Entry',
  EXHIBIT = 'Exhibit',
  HEARING = 'Hearing',
  MOTION = 'Motion',
}

export enum ExhibitStatus {
  MARKED = 'Marked',
  OFFERED = 'Offered',
  ADMITTED = 'Admitted',
  EXCLUDED = 'Excluded',
  WITHDRAWN = 'Withdrawn',
}

export enum ExhibitParty {
  PLAINTIFF = 'Plaintiff',
  DEFENSE = 'Defense',
  JOINT = 'Joint',
  COURT = 'Court',
}

export enum ServiceStatus {
  DRAFT = 'Draft',
  OUT_FOR_SERVICE = 'Out for Service',
  ATTEMPTED = 'Attempted',
  SERVED = 'Served',
  NON_EST = 'Non-Est',
  FILED = 'Filed',
  RETURNED = 'Returned',
}

export enum ServiceMethod {
  PROCESS_SERVER = 'Process Server',
  MAIL = 'Mail',
  PERSONAL = 'Personal',
  ELECTRONIC = 'Electronic',
}
