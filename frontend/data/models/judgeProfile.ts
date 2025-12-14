import { JudgeProfile, UUID } from '../../types';

export const MOCK_JUDGES: JudgeProfile[] = [
    {
        id: 'j1' as UUID, 
        name: 'Hon. Sarah Miller', 
        court: 'CA Superior - SF',
        grantRateDismiss: 65, 
        grantRateSummary: 42, 
        avgCaseDuration: 450,
        tendencies: ['Strict on discovery deadlines', 'favors mediation', 'Detailed rulings']
    },
    {
        id: 'j-brinkema' as UUID,
        name: 'Hon. Leonie M. Brinkema',
        court: 'E.D. Virginia (Alexandria)',
        grantRateDismiss: 72,
        grantRateSummary: 55,
        avgCaseDuration: 380,
        tendencies: ['Rocket Docket efficiency', 'Strict adherence to local rules', 'Expects preparedness']
    },
    {
        id: 'j-davis' as UUID,
        name: 'Magistrate Ivan D. Davis',
        court: 'E.D. Virginia (Alexandria)',
        grantRateDismiss: 40,
        grantRateSummary: 30,
        avgCaseDuration: 200,
        tendencies: ['Hands-on discovery management', 'Encourages settlement conferences']
    }
];

// Keep legacy export for backward compatibility if needed temporarily
export const MOCK_JUDGE = MOCK_JUDGES[0];