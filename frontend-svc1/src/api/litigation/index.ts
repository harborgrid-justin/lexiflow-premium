/**
 * Litigation Management API Services
 * Cases, docket entries, motions, pleadings, parties, and matter management
 */

export { CasePhasesApiService } from "./case-phases-api";
export { CaseTeamsApiService } from "./case-teams-api";
export { CasesApiService } from "./cases-api";
export { DocketApiService } from "./docket-api";
export { MattersApiService } from "./matters-api";
export { MotionsApiService } from "./motions-api";
export { PartiesApiService } from "./parties-api";
export type {
  CreatePartyDto,
  PartyRoleBackend,
  PartyTypeBackend,
} from "./parties-api";
export { PleadingsApiService } from "./pleadings-api";
