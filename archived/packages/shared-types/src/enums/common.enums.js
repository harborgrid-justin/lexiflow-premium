"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NavCategory = exports.LegalRuleType = exports.RiskStatus = exports.RiskLevel = exports.RiskCategory = exports.EntityRole = exports.EntityType = exports.OrganizationType = exports.TaskDependencyType = exports.StageStatus = exports.TaskStatus = void 0;
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["PENDING"] = "Pending";
    TaskStatus["IN_PROGRESS"] = "In Progress";
    TaskStatus["REVIEW"] = "Review";
    TaskStatus["DONE"] = "Done";
    TaskStatus["COMPLETED"] = "Completed";
    TaskStatus["BLOCKED"] = "Blocked";
    TaskStatus["CANCELLED"] = "Cancelled";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
var StageStatus;
(function (StageStatus) {
    StageStatus["PENDING"] = "Pending";
    StageStatus["ACTIVE"] = "Active";
    StageStatus["COMPLETED"] = "Completed";
})(StageStatus || (exports.StageStatus = StageStatus = {}));
var TaskDependencyType;
(function (TaskDependencyType) {
    TaskDependencyType["FINISH_TO_START"] = "FinishToStart";
    TaskDependencyType["START_TO_START"] = "StartToStart";
    TaskDependencyType["FINISH_TO_FINISH"] = "FinishToFinish";
    TaskDependencyType["START_TO_FINISH"] = "StartToFinish";
})(TaskDependencyType || (exports.TaskDependencyType = TaskDependencyType = {}));
var OrganizationType;
(function (OrganizationType) {
    OrganizationType["LAW_FIRM"] = "LawFirm";
    OrganizationType["CORPORATE"] = "Corporate";
    OrganizationType["GOVERNMENT"] = "Government";
    OrganizationType["COURT"] = "Court";
    OrganizationType["VENDOR"] = "Vendor";
})(OrganizationType || (exports.OrganizationType = OrganizationType = {}));
var EntityType;
(function (EntityType) {
    EntityType["INDIVIDUAL"] = "Individual";
    EntityType["CORPORATION"] = "Corporation";
    EntityType["COURT"] = "Court";
    EntityType["GOVERNMENT"] = "Government";
    EntityType["VENDOR"] = "Vendor";
    EntityType["LAW_FIRM"] = "Law Firm";
})(EntityType || (exports.EntityType = EntityType = {}));
var EntityRole;
(function (EntityRole) {
    EntityRole["CLIENT"] = "Client";
    EntityRole["OPPOSING_COUNSEL"] = "Opposing Counsel";
    EntityRole["JUDGE"] = "Judge";
    EntityRole["EXPERT"] = "Expert";
    EntityRole["WITNESS"] = "Witness";
    EntityRole["STAFF"] = "Staff";
    EntityRole["PROSPECT"] = "Prospect";
})(EntityRole || (exports.EntityRole = EntityRole = {}));
var RiskCategory;
(function (RiskCategory) {
    RiskCategory["LEGAL"] = "Legal";
    RiskCategory["FINANCIAL"] = "Financial";
    RiskCategory["REPUTATIONAL"] = "Reputational";
    RiskCategory["OPERATIONAL"] = "Operational";
    RiskCategory["STRATEGIC"] = "Strategic";
})(RiskCategory || (exports.RiskCategory = RiskCategory = {}));
var RiskLevel;
(function (RiskLevel) {
    RiskLevel["LOW"] = "Low";
    RiskLevel["MEDIUM"] = "Medium";
    RiskLevel["HIGH"] = "High";
    RiskLevel["CRITICAL"] = "Critical";
})(RiskLevel || (exports.RiskLevel = RiskLevel = {}));
var RiskStatus;
(function (RiskStatus) {
    RiskStatus["IDENTIFIED"] = "Identified";
    RiskStatus["MITIGATED"] = "Mitigated";
    RiskStatus["ACCEPTED"] = "Accepted";
    RiskStatus["CLOSED"] = "Closed";
})(RiskStatus || (exports.RiskStatus = RiskStatus = {}));
var LegalRuleType;
(function (LegalRuleType) {
    LegalRuleType["FRE"] = "FRE";
    LegalRuleType["FRCP"] = "FRCP";
    LegalRuleType["FRAP"] = "FRAP";
    LegalRuleType["LOCAL"] = "Local";
    LegalRuleType["STATE"] = "State";
})(LegalRuleType || (exports.LegalRuleType = LegalRuleType = {}));
var NavCategory;
(function (NavCategory) {
    NavCategory["MAIN"] = "Main";
    NavCategory["CASE_WORK"] = "Case Work";
    NavCategory["LITIGATION_TOOLS"] = "Litigation Tools";
    NavCategory["OPERATIONS"] = "Operations";
    NavCategory["KNOWLEDGE"] = "Knowledge";
    NavCategory["ADMIN"] = "Admin";
})(NavCategory || (exports.NavCategory = NavCategory = {}));
//# sourceMappingURL=common.enums.js.map