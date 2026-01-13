export declare enum MotionType {
    DISMISS = "Dismiss",
    SUMMARY_JUDGMENT = "Summary Judgment",
    COMPEL_DISCOVERY = "Compel Discovery",
    IN_LIMINE = "In Limine",
    CONTINUANCE = "Continuance",
    SANCTIONS = "Sanctions",
    PROTECTIVE_ORDER = "Protective Order",
    STRIKE = "Strike"
}
export declare enum MotionStatus {
    DRAFT = "Draft",
    FILED = "Filed",
    OPPOSITION_SERVED = "Opposition Served",
    REPLY_SERVED = "Reply Served",
    HEARING_SET = "Hearing Set",
    SUBMITTED = "Submitted",
    DECIDED = "Decided",
    WITHDRAWN = "Withdrawn"
}
export declare enum MotionOutcome {
    GRANTED = "Granted",
    DENIED = "Denied",
    WITHDRAWN = "Withdrawn",
    MOOT = "Moot",
    PARTIALLY_GRANTED = "Partially Granted"
}
export declare enum DocketEntryType {
    FILING = "Filing",
    ORDER = "Order",
    NOTICE = "Notice",
    MINUTE_ENTRY = "Minute Entry",
    EXHIBIT = "Exhibit",
    HEARING = "Hearing",
    MOTION = "Motion"
}
export declare enum ExhibitStatus {
    MARKED = "Marked",
    OFFERED = "Offered",
    ADMITTED = "Admitted",
    EXCLUDED = "Excluded",
    WITHDRAWN = "Withdrawn"
}
export declare enum ExhibitParty {
    PLAINTIFF = "Plaintiff",
    DEFENSE = "Defense",
    JOINT = "Joint",
    COURT = "Court"
}
export declare enum ServiceStatus {
    DRAFT = "Draft",
    OUT_FOR_SERVICE = "Out for Service",
    ATTEMPTED = "Attempted",
    SERVED = "Served",
    NON_EST = "Non-Est",
    FILED = "Filed",
    RETURNED = "Returned"
}
export declare enum ServiceMethod {
    PROCESS_SERVER = "Process Server",
    MAIL = "Mail",
    PERSONAL = "Personal",
    ELECTRONIC = "Electronic"
}
