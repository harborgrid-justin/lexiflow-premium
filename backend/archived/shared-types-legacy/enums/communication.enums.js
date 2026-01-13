"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunicationStatus = exports.CommunicationDirection = exports.CommunicationType = void 0;
var CommunicationType;
(function (CommunicationType) {
    CommunicationType["LETTER"] = "Letter";
    CommunicationType["EMAIL"] = "Email";
    CommunicationType["FAX"] = "Fax";
    CommunicationType["NOTICE"] = "Notice";
    CommunicationType["MEMO"] = "Memo";
})(CommunicationType || (exports.CommunicationType = CommunicationType = {}));
var CommunicationDirection;
(function (CommunicationDirection) {
    CommunicationDirection["INBOUND"] = "Inbound";
    CommunicationDirection["OUTBOUND"] = "Outbound";
})(CommunicationDirection || (exports.CommunicationDirection = CommunicationDirection = {}));
var CommunicationStatus;
(function (CommunicationStatus) {
    CommunicationStatus["DRAFT"] = "draft";
    CommunicationStatus["SENT"] = "sent";
    CommunicationStatus["DELIVERED"] = "delivered";
    CommunicationStatus["FAILED"] = "failed";
    CommunicationStatus["PENDING"] = "pending";
    CommunicationStatus["READ"] = "read";
    CommunicationStatus["ARCHIVED"] = "archived";
})(CommunicationStatus || (exports.CommunicationStatus = CommunicationStatus = {}));
//# sourceMappingURL=communication.enums.js.map