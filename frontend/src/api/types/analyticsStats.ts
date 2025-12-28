/**
 * Analytics Statistics Mock Data
 * 
 * @deprecated MOCK DATA - DO NOT IMPORT DIRECTLY
 * Use DataService.analytics APIs instead.
 * This constant is only for seeding and testing purposes.
 */

/**
 * @deprecated MOCK DATA - Use DataService.analytics instead
 */
export const MOCK_JUDGE_STATS = [
    { name: 'Motion to Dismiss', grant: 65, deny: 35 },
    { name: 'Summary Judgment', grant: 42, deny: 58 },
    { name: 'Discovery Compel', grant: 78, deny: 22 },
];

export const MOCK_OUTCOME_DATA = [
    { subject: 'Liability Strength', A: 80, fullMark: 100 },
    { subject: 'Damages Proof', A: 65, fullMark: 100 },
    { subject: 'Jurisdiction', A: 90, fullMark: 100 },
    { subject: 'Witness Cred.', A: 70, fullMark: 100 },
    { subject: 'Precedent', A: 85, fullMark: 100 },
];
