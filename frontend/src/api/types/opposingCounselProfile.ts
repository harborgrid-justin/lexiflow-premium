/**
 * Opposing Counsel Profile API Mock Data
 * 
 * @deprecated MOCK DATA - DO NOT IMPORT DIRECTLY
 * Use DataService.trial.getOpposingCounsel() instead.
 * This constant is only for seeding and testing purposes.
 */

import { OpposingCounselProfile } from '@/types/misc';
import { UUID } from '@/types/primitives';

/**
 * @deprecated MOCK DATA - Use DataService.trial instead
 */
export const MOCK_COUNSEL: OpposingCounselProfile[] = [
    {
        id: 'oc-1' as UUID,
        name: 'Morgan & Morgan', firm: 'National Plaintiffs',
        settlementRate: 85, trialRate: 15, avgSettlementVariance: 12
    },
    {
        id: 'oc-2' as UUID,
        name: 'Thomas Charles Junker', firm: 'MERCERTRIGIANI',
        settlementRate: 40, trialRate: 60, avgSettlementVariance: 5
    }
];
