/**
 * Opposition Party Mock Data
 * 
 * @deprecated MOCK DATA - DO NOT IMPORT DIRECTLY
 * Use DataService.trial.getOpposition() instead.
 * This constant is only for seeding and testing purposes.
 */

/**
 * @deprecated MOCK DATA - Use DataService.trial instead
 */
export const MOCK_OPPOSITION = [
    { 
        id: 'opp-1', 
        name: 'Robert Zane', 
        role: 'Lead Counsel', 
        firm: 'Pearson Specter Litt', 
        status: 'Active', 
        aggression: 'High',
        winRate: 85,
        tendency: 'Aggressive discovery motions',
        email: 'rzane@psl.com',
        notes: 'Known for leveraging procedural technicalities. Prefers to settle on courthouse steps.'
    },
    { 
        id: 'opp-2', 
        name: 'TechCorp Industries', 
        role: 'Defendant', 
        firm: 'In-House', 
        status: 'Active', 
        aggression: 'Medium',
        winRate: 60,
        tendency: 'Risk-averse, open to early mediation',
        notes: 'Decision maker is the GC, John Doe. Board approval required for settlements over $1M.'
    },
    { 
        id: 'opp-3', 
        name: 'Dr. Alan Shore', 
        role: 'Opposing Expert', 
        firm: 'Boston Consulting', 
        status: 'Retained', 
        aggression: 'Low',
        winRate: 70,
        tendency: 'Sticks to facts, very credible on stand',
        notes: 'Prior testimony has been excluded on grounds of speculation. Key area to attack on cross.'
    }
];
