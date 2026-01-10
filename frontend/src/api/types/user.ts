import { GroupId, OrgId, UserId } from "@/types/primitives";
import { User } from "@/types/system";

/**
 * @deprecated MOCK DATA - DO NOT IMPORT DIRECTLY
 * Use DataService.users.getAll() with queryKeys.users.all() instead
 * This constant is only for seeding and testing purposes.
 */
export const MOCK_USERS: User[] = [
  // Primary Admin User - Matched to XML Party Data
  {
    id: "usr-admin-justin" as UserId,
    firstName: "Justin",
    lastName: "Jeffrey Saadein-Morales",
    name: "Justin Jeffrey Saadein-Morales",
    email: "justin.saadein@harborgrid.com",
    role: "Administrator",
    orgId: "org-1" as OrgId,
    groupIds: ["g-1" as GroupId, "g-3" as GroupId, "g-admin" as GroupId],
    userType: "Internal",
    office: "Washington, DC",
  },
  // Secondary Users
  {
    id: "usr-partner-alex" as UserId,
    firstName: "Alexandra",
    lastName: "H.",
    name: "Alexandra H.",
    email: "alex@lexiflow.com",
    role: "Senior Partner",
    orgId: "org-1" as OrgId,
    groupIds: ["g-1" as GroupId, "g-3" as GroupId],
    userType: "Internal",
    office: "New York",
  },
  {
    id: "usr-assoc-james" as UserId,
    firstName: "James",
    lastName: "Doe",
    name: "James Doe",
    email: "james@lexiflow.com",
    role: "Associate",
    orgId: "org-1" as OrgId,
    groupIds: ["g-1" as GroupId],
    userType: "Internal",
    office: "Chicago",
  },
  {
    id: "usr-para-sarah" as UserId,
    firstName: "Sarah",
    lastName: "Jenkins",
    name: "Sarah Jenkins",
    email: "sarah@lexiflow.com",
    role: "Paralegal",
    orgId: "org-1" as OrgId,
    groupIds: ["g-1" as GroupId, "g-4" as GroupId],
    userType: "Internal",
    office: "New York",
  },
  // External Users
  {
    id: "usr-client-doe" as UserId,
    firstName: "John",
    lastName: "Doe (GC)",
    name: "John Doe (GC)",
    email: "j.doe@techcorp.com",
    role: "Client User",
    orgId: "org-2" as OrgId,
    groupIds: ["g-5" as GroupId],
    userType: "External",
    office: "San Francisco",
  },
];

export const HIERARCHY_USERS = MOCK_USERS;
