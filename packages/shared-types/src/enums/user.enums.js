"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "super_admin";
    UserRole["ADMIN"] = "admin";
    UserRole["SENIOR_PARTNER"] = "senior_partner";
    UserRole["PARTNER"] = "partner";
    UserRole["ATTORNEY"] = "attorney";
    UserRole["ASSOCIATE"] = "associate";
    UserRole["PARALEGAL"] = "paralegal";
    UserRole["LEGAL_SECRETARY"] = "legal_secretary";
    UserRole["STAFF"] = "staff";
    UserRole["CLIENT"] = "client";
    UserRole["CLIENT_USER"] = "client_user";
    UserRole["GUEST"] = "guest";
    UserRole["ADMINISTRATOR"] = "administrator";
})(UserRole || (exports.UserRole = UserRole = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "active";
    UserStatus["INACTIVE"] = "inactive";
    UserStatus["SUSPENDED"] = "suspended";
    UserStatus["PENDING"] = "pending";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
//# sourceMappingURL=user.enums.js.map