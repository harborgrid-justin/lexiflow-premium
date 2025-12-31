/**
 * Judge Profile API Mock Data
 * 
 * @deprecated MOCK DATA - DO NOT IMPORT DIRECTLY
 * Use DataService.jurisdiction.getJudges() instead.
 * This constant is only for seeding and testing purposes.
 */

import { JudgeProfile } from '@/types/misc';
import { UUID } from '@/types/primitives';

/**
 * @deprecated MOCK DATA - Use DataService.jurisdiction instead
 */
export const MOCK_JUDGES: JudgeProfile[] = [
    {
        id: 'j1' as UUID,
        name: 'Hon. Sarah Miller',
        court: 'CA Superior - SF',
        motionStats: [
            { motionType: 'Dismiss', granted: 45, denied: 24, totalRuled: 69, grantRate: 65 },
            { motionType: 'Summary Judgment', granted: 32, denied: 44, totalRuled: 76, grantRate: 42 }
        ],
        grantRateDismiss: 65,
        grantRateSummary: 42,
        avgCaseDuration: 450,
        tendencies: ['Strict on discovery deadlines', 'favors mediation', 'Detailed rulings']
    },
    {
        id: 'j-brinkema' as UUID,
        name: 'Hon. Leonie M. Brinkema',
        court: 'E.D. Virginia (Alexandria)',
        motionStats: [
            { motionType: 'Dismiss', granted: 58, denied: 22, totalRuled: 80, grantRate: 72 },
            { motionType: 'Summary Judgment', granted: 44, denied: 36, totalRuled: 80, grantRate: 55 }
        ],
        grantRateDismiss: 72,
        grantRateSummary: 55,
        avgCaseDuration: 380,
        tendencies: ['Rocket Docket efficiency', 'Strict adherence to local rules', 'Expects preparedness']
    },
    {
        id: 'j-davis' as UUID,
        name: 'Magistrate Ivan D. Davis',
        court: 'E.D. Virginia (Alexandria)',
        motionStats: [
            { motionType: 'Dismiss', granted: 24, denied: 36, totalRuled: 60, grantRate: 40 },
            { motionType: 'Summary Judgment', granted: 18, denied: 42, totalRuled: 60, grantRate: 30 }
        ],
        grantRateDismiss: 40,
        grantRateSummary: 30,
        avgCaseDuration: 200,
        tendencies: ['Hands-on discovery management', 'Encourages settlement conferences']
    }
];

// Keep legacy export for backward compatibility if needed temporarily
export const MOCK_JUDGE = MOCK_JUDGES[0];
