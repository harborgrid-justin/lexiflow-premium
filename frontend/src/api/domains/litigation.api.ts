/**
 * Litigation Domain API Services
 * Case management, docket, motions, pleadings, and parties
 */

import { CasesApiService } from '@/api';
import { DocketApiService } from '@/api';
import { MotionsApiService } from '@/api';
import { PleadingsApiService } from '@/api';
import { PartiesApiService } from '@/api';
import { CaseTeamsApiService } from '@/api';
import { CasePhasesApiService } from '@/api';
import { MattersApiService } from '@/api';

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
