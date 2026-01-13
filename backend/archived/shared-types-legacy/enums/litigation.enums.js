"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceMethod = exports.ServiceStatus = exports.ExhibitParty = exports.ExhibitStatus = exports.DocketEntryType = exports.MotionOutcome = exports.MotionStatus = exports.MotionType = void 0;
var MotionType;
(function (MotionType) {
    MotionType["DISMISS"] = "Dismiss";
    MotionType["SUMMARY_JUDGMENT"] = "Summary Judgment";
    MotionType["COMPEL_DISCOVERY"] = "Compel Discovery";
    MotionType["IN_LIMINE"] = "In Limine";
    MotionType["CONTINUANCE"] = "Continuance";
    MotionType["SANCTIONS"] = "Sanctions";
    MotionType["PROTECTIVE_ORDER"] = "Protective Order";
    MotionType["STRIKE"] = "Strike";
})(MotionType || (exports.MotionType = MotionType = {}));
var MotionStatus;
(function (MotionStatus) {
    MotionStatus["DRAFT"] = "Draft";
    MotionStatus["FILED"] = "Filed";
    MotionStatus["OPPOSITION_SERVED"] = "Opposition Served";
    MotionStatus["REPLY_SERVED"] = "Reply Served";
    MotionStatus["HEARING_SET"] = "Hearing Set";
    MotionStatus["SUBMITTED"] = "Submitted";
    MotionStatus["DECIDED"] = "Decided";
    MotionStatus["WITHDRAWN"] = "Withdrawn";
})(MotionStatus || (exports.MotionStatus = MotionStatus = {}));
var MotionOutcome;
(function (MotionOutcome) {
    MotionOutcome["GRANTED"] = "Granted";
    MotionOutcome["DENIED"] = "Denied";
    MotionOutcome["WITHDRAWN"] = "Withdrawn";
    MotionOutcome["MOOT"] = "Moot";
    MotionOutcome["PARTIALLY_GRANTED"] = "Partially Granted";
})(MotionOutcome || (exports.MotionOutcome = MotionOutcome = {}));
var DocketEntryType;
(function (DocketEntryType) {
    DocketEntryType["FILING"] = "Filing";
    DocketEntryType["ORDER"] = "Order";
    DocketEntryType["NOTICE"] = "Notice";
    DocketEntryType["MINUTE_ENTRY"] = "Minute Entry";
    DocketEntryType["EXHIBIT"] = "Exhibit";
    DocketEntryType["HEARING"] = "Hearing";
    DocketEntryType["MOTION"] = "Motion";
})(DocketEntryType || (exports.DocketEntryType = DocketEntryType = {}));
var ExhibitStatus;
(function (ExhibitStatus) {
    ExhibitStatus["MARKED"] = "Marked";
    ExhibitStatus["OFFERED"] = "Offered";
    ExhibitStatus["ADMITTED"] = "Admitted";
    ExhibitStatus["EXCLUDED"] = "Excluded";
    ExhibitStatus["WITHDRAWN"] = "Withdrawn";
})(ExhibitStatus || (exports.ExhibitStatus = ExhibitStatus = {}));
var ExhibitParty;
(function (ExhibitParty) {
    ExhibitParty["PLAINTIFF"] = "Plaintiff";
    ExhibitParty["DEFENSE"] = "Defense";
    ExhibitParty["JOINT"] = "Joint";
    ExhibitParty["COURT"] = "Court";
})(ExhibitParty || (exports.ExhibitParty = ExhibitParty = {}));
var ServiceStatus;
(function (ServiceStatus) {
    ServiceStatus["DRAFT"] = "Draft";
    ServiceStatus["OUT_FOR_SERVICE"] = "Out for Service";
    ServiceStatus["ATTEMPTED"] = "Attempted";
    ServiceStatus["SERVED"] = "Served";
    ServiceStatus["NON_EST"] = "Non-Est";
    ServiceStatus["FILED"] = "Filed";
    ServiceStatus["RETURNED"] = "Returned";
})(ServiceStatus || (exports.ServiceStatus = ServiceStatus = {}));
var ServiceMethod;
(function (ServiceMethod) {
    ServiceMethod["PROCESS_SERVER"] = "Process Server";
    ServiceMethod["MAIL"] = "Mail";
    ServiceMethod["PERSONAL"] = "Personal";
    ServiceMethod["ELECTRONIC"] = "Electronic";
})(ServiceMethod || (exports.ServiceMethod = ServiceMethod = {}));
//# sourceMappingURL=litigation.enums.js.map