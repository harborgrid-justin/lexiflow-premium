export declare enum TaskStatus {
    PENDING = "Pending",
    IN_PROGRESS = "In Progress",
    REVIEW = "Review",
    DONE = "Done",
    COMPLETED = "Completed",
    BLOCKED = "Blocked",
    CANCELLED = "Cancelled"
}
export declare enum StageStatus {
    PENDING = "Pending",
    ACTIVE = "Active",
    COMPLETED = "Completed"
}
export declare enum TaskDependencyType {
    FINISH_TO_START = "FinishToStart",
    START_TO_START = "StartToStart",
    FINISH_TO_FINISH = "FinishToFinish",
    START_TO_FINISH = "StartToFinish"
}
export declare enum OrganizationType {
    LAW_FIRM = "LawFirm",
    CORPORATE = "Corporate",
    GOVERNMENT = "Government",
    COURT = "Court",
    VENDOR = "Vendor"
}
export declare enum EntityType {
    INDIVIDUAL = "Individual",
    CORPORATION = "Corporation",
    COURT = "Court",
    GOVERNMENT = "Government",
    VENDOR = "Vendor",
    LAW_FIRM = "Law Firm"
}
export declare enum EntityRole {
    CLIENT = "Client",
    OPPOSING_COUNSEL = "Opposing Counsel",
    JUDGE = "Judge",
    EXPERT = "Expert",
    WITNESS = "Witness",
    STAFF = "Staff",
    PROSPECT = "Prospect"
}
export declare enum RiskCategory {
    LEGAL = "Legal",
    FINANCIAL = "Financial",
    REPUTATIONAL = "Reputational",
    OPERATIONAL = "Operational",
    STRATEGIC = "Strategic"
}
export declare enum RiskLevel {
    LOW = "Low",
    MEDIUM = "Medium",
    HIGH = "High",
    CRITICAL = "Critical"
}
export declare enum RiskStatus {
    IDENTIFIED = "Identified",
    MITIGATED = "Mitigated",
    ACCEPTED = "Accepted",
    CLOSED = "Closed"
}
export declare enum LegalRuleType {
    FRE = "FRE",
    FRCP = "FRCP",
    FRAP = "FRAP",
    LOCAL = "Local",
    STATE = "State"
}
export declare enum NavCategory {
    MAIN = "Main",
    CASE_WORK = "Case Work",
    LITIGATION_TOOLS = "Litigation Tools",
    OPERATIONS = "Operations",
    KNOWLEDGE = "Knowledge",
    ADMIN = "Admin"
}
