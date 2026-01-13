"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrencyCode = exports.TrustAccountStatus = exports.ExpenseStatus = exports.WIPStatus = exports.PaymentStatus = exports.InvoiceStatus = void 0;
var InvoiceStatus;
(function (InvoiceStatus) {
    InvoiceStatus["DRAFT"] = "Draft";
    InvoiceStatus["PENDING"] = "Pending";
    InvoiceStatus["SENT"] = "Sent";
    InvoiceStatus["PARTIAL"] = "Partial";
    InvoiceStatus["PAID"] = "Paid";
    InvoiceStatus["OVERDUE"] = "Overdue";
    InvoiceStatus["WRITTEN_OFF"] = "Written Off";
    InvoiceStatus["CANCELLED"] = "Cancelled";
})(InvoiceStatus || (exports.InvoiceStatus = InvoiceStatus = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "Pending";
    PaymentStatus["PROCESSING"] = "Processing";
    PaymentStatus["COMPLETED"] = "Completed";
    PaymentStatus["FAILED"] = "Failed";
    PaymentStatus["REFUNDED"] = "Refunded";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var WIPStatus;
(function (WIPStatus) {
    WIPStatus["UNBILLED"] = "Unbilled";
    WIPStatus["READY_TO_BILL"] = "Ready to Bill";
    WIPStatus["BILLED"] = "Billed";
    WIPStatus["WRITTEN_OFF"] = "Written Off";
})(WIPStatus || (exports.WIPStatus = WIPStatus = {}));
var ExpenseStatus;
(function (ExpenseStatus) {
    ExpenseStatus["DRAFT"] = "Draft";
    ExpenseStatus["SUBMITTED"] = "Submitted";
    ExpenseStatus["APPROVED"] = "Approved";
    ExpenseStatus["REJECTED"] = "Rejected";
    ExpenseStatus["BILLED"] = "Billed";
    ExpenseStatus["REIMBURSED"] = "Reimbursed";
})(ExpenseStatus || (exports.ExpenseStatus = ExpenseStatus = {}));
var TrustAccountStatus;
(function (TrustAccountStatus) {
    TrustAccountStatus["ACTIVE"] = "Active";
    TrustAccountStatus["INACTIVE"] = "Inactive";
    TrustAccountStatus["SUSPENDED"] = "Suspended";
    TrustAccountStatus["CLOSED"] = "Closed";
})(TrustAccountStatus || (exports.TrustAccountStatus = TrustAccountStatus = {}));
var CurrencyCode;
(function (CurrencyCode) {
    CurrencyCode["USD"] = "USD";
    CurrencyCode["EUR"] = "EUR";
    CurrencyCode["GBP"] = "GBP";
    CurrencyCode["CAD"] = "CAD";
})(CurrencyCode || (exports.CurrencyCode = CurrencyCode = {}));
//# sourceMappingURL=billing.enums.js.map