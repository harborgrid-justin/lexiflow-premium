"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConferralMethod = exports.ConferralResult = exports.PrivilegeBasis = exports.LegalHoldStatus = exports.ESICollectionStatus = exports.DiscoveryRequestStatus = exports.DiscoveryStatus = exports.DiscoveryType = void 0;
var DiscoveryType;
(function (DiscoveryType) {
    DiscoveryType["PRODUCTION"] = "Production";
    DiscoveryType["INTERROGATORY"] = "Interrogatory";
    DiscoveryType["ADMISSION"] = "Admission";
    DiscoveryType["DEPOSITION"] = "Deposition";
})(DiscoveryType || (exports.DiscoveryType = DiscoveryType = {}));
var DiscoveryStatus;
(function (DiscoveryStatus) {
    DiscoveryStatus["DRAFT"] = "Draft";
    DiscoveryStatus["SERVED"] = "Served";
    DiscoveryStatus["RESPONDED"] = "Responded";
    DiscoveryStatus["OVERDUE"] = "Overdue";
    DiscoveryStatus["CLOSED"] = "Closed";
    DiscoveryStatus["MOTION_FILED"] = "Motion Filed";
})(DiscoveryStatus || (exports.DiscoveryStatus = DiscoveryStatus = {}));
var DiscoveryRequestStatus;
(function (DiscoveryRequestStatus) {
    DiscoveryRequestStatus["SERVED"] = "Served";
    DiscoveryRequestStatus["PENDING"] = "Pending";
    DiscoveryRequestStatus["RESPONDED"] = "Responded";
    DiscoveryRequestStatus["OVERDUE"] = "Overdue";
})(DiscoveryRequestStatus || (exports.DiscoveryRequestStatus = DiscoveryRequestStatus = {}));
var ESICollectionStatus;
(function (ESICollectionStatus) {
    ESICollectionStatus["PENDING"] = "Pending";
    ESICollectionStatus["COLLECTING"] = "Collecting";
    ESICollectionStatus["COLLECTED"] = "Collected";
    ESICollectionStatus["PROCESSING"] = "Processing";
    ESICollectionStatus["PROCESSED"] = "Processed";
    ESICollectionStatus["PRODUCED"] = "Produced";
    ESICollectionStatus["ERROR"] = "Error";
})(ESICollectionStatus || (exports.ESICollectionStatus = ESICollectionStatus = {}));
var LegalHoldStatus;
(function (LegalHoldStatus) {
    LegalHoldStatus["PENDING"] = "Pending";
    LegalHoldStatus["ACKNOWLEDGED"] = "Acknowledged";
    LegalHoldStatus["REMINDER_SENT"] = "Reminder Sent";
    LegalHoldStatus["RELEASED"] = "Released";
})(LegalHoldStatus || (exports.LegalHoldStatus = LegalHoldStatus = {}));
var PrivilegeBasis;
(function (PrivilegeBasis) {
    PrivilegeBasis["ATTORNEY_CLIENT"] = "Attorney-Client";
    PrivilegeBasis["WORK_PRODUCT"] = "Work Product";
    PrivilegeBasis["JOINT_DEFENSE"] = "Joint Defense";
    PrivilegeBasis["COMMON_INTEREST"] = "Common Interest";
})(PrivilegeBasis || (exports.PrivilegeBasis = PrivilegeBasis = {}));
var ConferralResult;
(function (ConferralResult) {
    ConferralResult["AGREED"] = "Agreed";
    ConferralResult["IMPASSE"] = "Impasse";
    ConferralResult["PARTIAL_AGREEMENT"] = "Partial Agreement";
    ConferralResult["PENDING"] = "Pending";
})(ConferralResult || (exports.ConferralResult = ConferralResult = {}));
var ConferralMethod;
(function (ConferralMethod) {
    ConferralMethod["EMAIL"] = "Email";
    ConferralMethod["PHONE"] = "Phone";
    ConferralMethod["IN_PERSON"] = "In-Person";
    ConferralMethod["VIDEO_CONFERENCE"] = "Video Conference";
})(ConferralMethod || (exports.ConferralMethod = ConferralMethod = {}));
//# sourceMappingURL=discovery.enums.js.map