"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingModel = exports.MatterType = exports.CaseType = exports.CaseStatus = void 0;
var CaseStatus;
(function (CaseStatus) {
    CaseStatus["OPEN"] = "Open";
    CaseStatus["ACTIVE"] = "Active";
    CaseStatus["DISCOVERY"] = "Discovery";
    CaseStatus["TRIAL"] = "Trial";
    CaseStatus["SETTLED"] = "Settled";
    CaseStatus["CLOSED"] = "Closed";
    CaseStatus["ARCHIVED"] = "Archived";
    CaseStatus["ON_HOLD"] = "On Hold";
    CaseStatus["PRE_FILING"] = "Pre-Filing";
    CaseStatus["APPEAL"] = "Appeal";
    CaseStatus["TRANSFERRED"] = "Transferred";
})(CaseStatus || (exports.CaseStatus = CaseStatus = {}));
var CaseType;
(function (CaseType) {
    CaseType["CIVIL"] = "Civil";
    CaseType["CRIMINAL"] = "Criminal";
    CaseType["FAMILY"] = "Family";
    CaseType["BANKRUPTCY"] = "Bankruptcy";
    CaseType["IMMIGRATION"] = "Immigration";
    CaseType["INTELLECTUAL_PROPERTY"] = "Intellectual Property";
    CaseType["CORPORATE"] = "Corporate";
    CaseType["REAL_ESTATE"] = "Real Estate";
    CaseType["LABOR"] = "Labor";
    CaseType["ENVIRONMENTAL"] = "Environmental";
    CaseType["TAX"] = "Tax";
    CaseType["LITIGATION"] = "Litigation";
    CaseType["MA"] = "M&A";
    CaseType["IP"] = "IP";
    CaseType["GENERAL"] = "General";
})(CaseType || (exports.CaseType = CaseType = {}));
var MatterType;
(function (MatterType) {
    MatterType["LITIGATION"] = "Litigation";
    MatterType["MA"] = "M&A";
    MatterType["IP"] = "IP";
    MatterType["REAL_ESTATE"] = "Real Estate";
    MatterType["GENERAL"] = "General";
    MatterType["APPEAL"] = "Appeal";
})(MatterType || (exports.MatterType = MatterType = {}));
var BillingModel;
(function (BillingModel) {
    BillingModel["HOURLY"] = "Hourly";
    BillingModel["FIXED"] = "Fixed";
    BillingModel["CONTINGENCY"] = "Contingency";
    BillingModel["HYBRID"] = "Hybrid";
})(BillingModel || (exports.BillingModel = BillingModel = {}));
//# sourceMappingURL=case.enums.js.map