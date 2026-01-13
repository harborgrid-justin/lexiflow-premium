"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustodyActionType = exports.AdmissibilityStatus = exports.EvidenceType = void 0;
var EvidenceType;
(function (EvidenceType) {
    EvidenceType["PHYSICAL"] = "Physical";
    EvidenceType["DIGITAL"] = "Digital";
    EvidenceType["DOCUMENT"] = "Document";
    EvidenceType["TESTIMONY"] = "Testimony";
    EvidenceType["FORENSIC"] = "Forensic";
})(EvidenceType || (exports.EvidenceType = EvidenceType = {}));
var AdmissibilityStatus;
(function (AdmissibilityStatus) {
    AdmissibilityStatus["ADMISSIBLE"] = "Admissible";
    AdmissibilityStatus["CHALLENGED"] = "Challenged";
    AdmissibilityStatus["INADMISSIBLE"] = "Inadmissible";
    AdmissibilityStatus["PENDING"] = "Pending";
})(AdmissibilityStatus || (exports.AdmissibilityStatus = AdmissibilityStatus = {}));
var CustodyActionType;
(function (CustodyActionType) {
    CustodyActionType["INITIAL_COLLECTION"] = "Initial Collection";
    CustodyActionType["TRANSFER_TO_STORAGE"] = "Transfer to Storage";
    CustodyActionType["TRANSFER_TO_LAB"] = "Transfer to Lab";
    CustodyActionType["RETURNED_TO_CLIENT"] = "Returned to Client";
    CustodyActionType["SENT_FOR_ANALYSIS"] = "Sent for Analysis";
    CustodyActionType["CHECKED_OUT"] = "Checked Out";
    CustodyActionType["CHECKED_IN"] = "Checked In";
    CustodyActionType["DISPOSED"] = "Disposed";
})(CustodyActionType || (exports.CustodyActionType = CustodyActionType = {}));
//# sourceMappingURL=evidence.enums.js.map