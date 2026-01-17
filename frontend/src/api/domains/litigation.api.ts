/**
 * Litigation Domain API Services
 * Case management, docket, motions, pleadings, and parties
 */

import { CasePhasesApiService } from '../litigation/case-phases-api';
import { CaseTeamsApiService } from '../litigation/case-teams-api';
import { CasesApiService } from '../litigation/cases-api';
import { DocketApiService } from '../litigation/docket-api';
import { MattersApiService } from '../litigation/matters-api';
import { MotionsApiService } from '../litigation/motions-api';
import { PartiesApiService } from '../litigation/parties-api';
import { PleadingsApiService } from '../litigation/pleadings-api';

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
