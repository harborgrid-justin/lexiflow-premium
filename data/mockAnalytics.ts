
import { JudgeProfile, JudgeMotionStat, OpposingCounselProfile, OutcomePredictionData, UUID } from '../types';

export const MOCK_JUDGE_STATS: JudgeMotionStat[] = [
    { name: 'Motion to Dismiss', grant: 65, deny: 35 },
    { name: 'Summary Judgment', grant: 42, deny: 58 },
    { name: 'Discovery Compel', grant: 78, deny: 22 },
];

export const MOCK_OUTCOME_DATA: OutcomePredictionData[] = [
    { subject: 'Liability Strength', A: 80, fullMark: 100 },
    { subject: 'Damages Proof', A: 65, fullMark: 100 },
    { subject: 'Jurisdiction', A: 90, fullMark: 100 },
    { subject: 'Witness Cred.', A: 70, fullMark: 100 },
    { subject: 'Precedent', A: 85, fullMark: 100 },
];

export const MOCK_JUDGE: JudgeProfile = {
    id: 'j1' as UUID,
    name: 'Hon. Sarah Miller',
    court: 'CA Superior - SF',
    grantRateDismiss: 65,
    grantRateSummary: 42,
    avgCaseDuration: 450,
    tendencies: ['Strict on discovery deadlines', 'favors mediation', 'Detailed rulings']
};

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