/**
 * Litigation Domain API Services
 * Case management, docket, motions, pleadings, and parties
 */

import { CasesApiService } from '../cases-api';
import { DocketApiService } from '../docket-api';
import { MotionsApiService } from '../motions-api';
import { PleadingsApiService } from '../pleadings-api';
import { PartiesApiService } from '../parties-api';
import { CaseTeamsApiService } from '../case-teams-api';
import { CasePhasesApiService } from '../case-phases-api';
import { MattersApiService } from '../matters-api';

// Export service classes
export {
  CasesApiService,
  DocketApiService,
  MotionsApiService,
  PleadingsApiService,
  PartiesApiService,
  CaseTeamsApiService,
  CasePhasesApiService,
  MattersApiService,
};

// Export singleton instances
export const litigationApi = {
  cases: new CasesApiService(),
  docket: new DocketApiService(),
  motions: new MotionsApiService(),
  pleadings: new PleadingsApiService(),
  parties: new PartiesApiService(),
  caseTeams: new CaseTeamsApiService(),
  casePhases: new CasePhasesApiService(),
  matters: new MattersApiService(),
} as const;
