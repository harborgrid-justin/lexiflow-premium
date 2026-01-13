"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OcrStatus = exports.DocumentAccessLevel = exports.DocumentType = exports.DocumentStatus = void 0;
var DocumentStatus;
(function (DocumentStatus) {
    DocumentStatus["DRAFT"] = "draft";
    DocumentStatus["UNDER_REVIEW"] = "under_review";
    DocumentStatus["APPROVED"] = "approved";
    DocumentStatus["FILED"] = "filed";
    DocumentStatus["ARCHIVED"] = "archived";
})(DocumentStatus || (exports.DocumentStatus = DocumentStatus = {}));
var DocumentType;
(function (DocumentType) {
    DocumentType["MOTION"] = "Motion";
    DocumentType["BRIEF"] = "Brief";
    DocumentType["COMPLAINT"] = "Complaint";
    DocumentType["ANSWER"] = "Answer";
    DocumentType["DISCOVERY_REQUEST"] = "Discovery Request";
    DocumentType["DISCOVERY_RESPONSE"] = "Discovery Response";
    DocumentType["EXHIBIT"] = "Exhibit";
    DocumentType["CONTRACT"] = "Contract";
    DocumentType["LETTER"] = "Letter";
    DocumentType["MEMO"] = "Memo";
    DocumentType["PLEADING"] = "Pleading";
    DocumentType["ORDER"] = "Order";
    DocumentType["TRANSCRIPT"] = "Transcript";
    DocumentType["CORRESPONDENCE"] = "Correspondence";
    DocumentType["AGREEMENT"] = "Agreement";
    DocumentType["EVIDENCE"] = "Evidence";
})(DocumentType || (exports.DocumentType = DocumentType = {}));
var DocumentAccessLevel;
(function (DocumentAccessLevel) {
    DocumentAccessLevel["PUBLIC"] = "public";
    DocumentAccessLevel["INTERNAL"] = "internal";
    DocumentAccessLevel["CONFIDENTIAL"] = "confidential";
    DocumentAccessLevel["PRIVILEGED"] = "privileged";
    DocumentAccessLevel["ATTORNEY_WORK_PRODUCT"] = "attorney_work_product";
})(DocumentAccessLevel || (exports.DocumentAccessLevel = DocumentAccessLevel = {}));
var OcrStatus;
(function (OcrStatus) {
    OcrStatus["PENDING"] = "Pending";
    OcrStatus["PROCESSING"] = "Processing";
    OcrStatus["COMPLETED"] = "Completed";
    OcrStatus["FAILED"] = "Failed";
})(OcrStatus || (exports.OcrStatus = OcrStatus = {}));
//# sourceMappingURL=document.enums.js.map