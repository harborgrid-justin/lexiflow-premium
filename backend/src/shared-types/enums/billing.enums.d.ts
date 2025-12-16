export declare enum InvoiceStatus {
    DRAFT = "Draft",
    PENDING = "Pending",
    SENT = "Sent",
    PARTIAL = "Partial",
    PAID = "Paid",
    OVERDUE = "Overdue",
    WRITTEN_OFF = "Written Off",
    CANCELLED = "Cancelled"
}
export declare enum PaymentStatus {
    PENDING = "Pending",
    PROCESSING = "Processing",
    COMPLETED = "Completed",
    FAILED = "Failed",
    REFUNDED = "Refunded"
}
export declare enum WIPStatus {
    UNBILLED = "Unbilled",
    READY_TO_BILL = "Ready to Bill",
    BILLED = "Billed",
    WRITTEN_OFF = "Written Off"
}
export declare enum ExpenseStatus {
    DRAFT = "Draft",
    SUBMITTED = "Submitted",
    APPROVED = "Approved",
    REJECTED = "Rejected",
    BILLED = "Billed",
    REIMBURSED = "Reimbursed"
}
export declare enum TrustAccountStatus {
    ACTIVE = "Active",
    INACTIVE = "Inactive",
    SUSPENDED = "Suspended",
    CLOSED = "Closed"
}
export declare enum CurrencyCode {
    USD = "USD",
    EUR = "EUR",
    GBP = "GBP",
    CAD = "CAD"
}
export type LedesActivityCode = string;
export type LedesTaskCode = string;
