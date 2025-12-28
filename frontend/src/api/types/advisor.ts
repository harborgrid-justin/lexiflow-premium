/**
 * Advisor API Mock Data
 * 
 * @deprecated MOCK DATA - DO NOT IMPORT DIRECTLY
 * Use DataService.trial.getAdvisors() instead.
 * This constant is only for seeding and testing purposes.
 */

/**
 * @deprecated MOCK DATA - Use DataService.trial instead
 */
export const MOCK_ADVISORS = [
    { 
        id: 'exp-1', 
        name: 'Dr. Emily Chen', 
        role: 'Expert Witness', 
        specialty: 'Forensic Accounting', 
        status: 'Retained', 
        rate: 650,
        email: 'echen@forensics.com',
        phone: '555-123-4567',
        readiness: 75,
        reports: 2,
        notes: 'Strong on valuation, weaker on causation arguments. Use for damages phase only.'
    },
    { 
        id: 'exp-2', 
        name: 'Mark Johnson', 
        role: 'Jury Consultant', 
        specialty: 'Voir Dire Strategy', 
        status: 'Active', 
        rate: 800,
        email: 'markj@trialconsult.com',
        phone: '555-987-6543',
        readiness: 100,
        reports: 1,
        notes: 'Excellent track record in SF Superior Court. Provided detailed demographic analysis.'
    },
    { 
        id: 'exp-3', 
        name: 'Dr. Allen Smith', 
        role: 'Expert Witness', 
        specialty: 'Medical Diagnostics', 
        status: 'Pending', 
        rate: 950,
        email: 'asmith@medexperts.com',
        phone: '555-222-3333',
        readiness: 20,
        reports: 0,
        notes: 'Potential Daubert challenge on methodology. Needs careful prep.'
    },
];
