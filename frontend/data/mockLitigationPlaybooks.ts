/**
 * @deprecated MOCK DATA - DO NOT IMPORT DIRECTLY
 * Use DataService.playbooks.getAll() with queryKeys.playbooks.all() instead
 * This file provides type definitions and seed data for backend.
 */

export interface PlaybookStage {
  name: string;
  duration: string;
  criticalTasks: string[];
}

export interface LinkedAuthority {
  id: string;
  title: string;
  citation: string;
  type: 'Case' | 'Statute' | 'Rule';
  relevance: string;
}

export interface Playbook {
  id: string;
  title: string;
  category: string;
  jurisdiction: string;
  difficulty: 'Low' | 'Medium' | 'High';
  phases: number;
  description: string;
  tags: string[];
  readiness: number;
  status: string;
  // New Deep Content Fields
  stages: PlaybookStage[];
  authorities: LinkedAuthority[];
  warRoomConfig: {
    recommendedTabs: string[];
    evidenceTags: string[];
  };
  strategyNotes: string;
}

export const LITIGATION_PLAYBOOKS: Playbook[] = [
  // Commercial / Contract
  { 
    id: 'pb-1', title: 'Breach of Contract (Plaintiff)', category: 'Commercial', jurisdiction: 'Federal', difficulty: 'Medium', phases: 5, 
    description: 'Standard plaintiff strategy for material breach of commercial contracts, focusing on early damages calculation and Rule 26 disclosures.', 
    tags: ['Contract', 'Damages', 'UCC'], readiness: 100, status: 'Production Ready',
    stages: [
      { name: 'Pleading', duration: '30 Days', criticalTasks: ['Draft Complaint', 'Serve Process', 'Rule 26(f) Conference'] },
      { name: 'Discovery', duration: '90-120 Days', criticalTasks: ['Request for Production (Contracts)', 'Interrogatories on Breach', 'Depose Signatories'] },
      { name: 'Dispositive Motions', duration: '45 Days', criticalTasks: ['Defend 12(b)(6)', 'File MSJ on Liability'] },
      { name: 'Trial Prep', duration: '60 Days', criticalTasks: ['Motions in Limine', 'Damages Expert Report', 'Jury Instructions'] },
      { name: 'Trial', duration: '5-10 Days', criticalTasks: ['Opening Statement', 'Direct of Plaintiff', 'Cross of Defense', 'Closing'] }
    ],
    authorities: [
      { id: 'cit-1', title: 'Hadley v. Baxendale', citation: '9 Exch. 341 (1854)', type: 'Case', relevance: 'Foreseeability of damages' },
      { id: 'cit-2', title: 'UCC Article 2', citation: 'U.C.C. § 2-711', type: 'Statute', relevance: 'Buyer remedies' },
      { id: 'cit-3', title: 'FRCP 8(a)', citation: 'Fed. R. Civ. P. 8', type: 'Rule', relevance: 'Pleading standard' }
    ],
    warRoomConfig: { recommendedTabs: ['evidence', 'witnesses', 'binder'], evidenceTags: ['Contract', 'Communication', 'Invoice'] },
    strategyNotes: 'Focus on the "Four Corners" rule. Avoid parol evidence issues by establishing integration early.'
  },
  { 
    id: 'pb-2', title: 'Breach of Contract Defense', category: 'Commercial', jurisdiction: 'State', difficulty: 'Medium', phases: 5, 
    description: 'Defense strategy focusing on affirmative defenses (waiver, estoppel, impossibility) and countersuits.', 
    tags: ['Defense', 'Contract', 'Affirmative Defense'], readiness: 100, status: 'Production Ready',
    stages: [
      { name: 'Responsive Pleading', duration: '21 Days', criticalTasks: ['Analyze Affirmative Defenses', 'File Answer/Counterclaim'] },
      { name: 'Discovery', duration: '120 Days', criticalTasks: ['RFP for Modification Evidence', 'Depose Plaintiff on Mitigation'] }
    ],
    authorities: [
      { id: 'cit-4', title: 'Restatement (Second) of Contracts', citation: '§ 261', type: 'Rule', relevance: 'Impracticability defense' }
    ],
    warRoomConfig: { recommendedTabs: ['opposition', 'evidence'], evidenceTags: ['Prior Dealings', 'Waiver'] },
    strategyNotes: 'Attack the damage model immediately. Force plaintiff to prove mitigation efforts.'
  },
  { 
    id: 'pb-3', title: 'Complex M&A Dispute', category: 'Commercial', jurisdiction: 'Delaware', difficulty: 'High', phases: 8, 
    description: 'Post-closing adjustment disputes and earn-out litigation in Chancery Court.', 
    tags: ['M&A', 'Finance', 'Chancery'], readiness: 100, status: 'Production Ready',
    stages: [
        { name: 'Expedited Proceedings', duration: 'Varies', criticalTasks: ['Motion for Expedited Proceedings', 'Status Quo Order'] },
        { name: 'Discovery', duration: '60-90 Days', criticalTasks: ['Forensic Accounting Review', 'Executive Depositions'] }
    ],
    authorities: [
        { id: 'cit-5', title: 'Akorn, Inc. v. Fresenius', citation: 'C.A. No. 2018-0300-JTL', type: 'Case', relevance: 'Material Adverse Effect (MAE)' }
    ],
    warRoomConfig: { recommendedTabs: ['advisory', 'evidence'], evidenceTags: ['Financials', 'Board Minutes'] },
    strategyNotes: 'Delaware courts strictly construe MAE clauses. Focus on long-term duration impact.'
  },
  // ... (Expanding existing items with rich data - abbreviated for brevity but keeping structure)
  { 
    id: 'pb-11', title: 'Patent Infringement (Plaintiff)', category: 'IP', jurisdiction: 'Federal', difficulty: 'High', phases: 10, 
    description: 'Enforcing patent rights against competitors. Includes Markman hearing prep.', 
    tags: ['Patent', 'Markman', 'Fed. Cir.'], readiness: 100, status: 'Production Ready',
    stages: [
        { name: 'Pre-Suit', duration: '30 Days', criticalTasks: ['Claim Charting', 'Infringement Analysis'] },
        { name: 'Pleading', duration: '30 Days', criticalTasks: ['File Complaint', 'Serve Defendant'] },
        { name: 'Markman', duration: '90 Days', criticalTasks: ['Claim Construction Briefing', 'Markman Hearing'] },
        { name: 'Discovery', duration: '6 Months', criticalTasks: ['Technical Doc Production', 'Source Code Review'] }
    ],
    authorities: [
        { id: 'cit-ip-1', title: 'Markman v. Westview', citation: '517 U.S. 370', type: 'Case', relevance: 'Claim construction is law' },
        { id: 'cit-ip-2', title: 'Alice Corp. v. CLS Bank', citation: '573 U.S. 208', type: 'Case', relevance: 'Section 101 Eligibility' }
    ],
    warRoomConfig: { recommendedTabs: ['evidence', 'advisory', 'opposition'], evidenceTags: ['Prior Art', 'Source Code', 'File History'] },
    strategyNotes: 'Win the Markman hearing to force settlement. Define claims to read on the accused product but avoid prior art.'
  },
  { 
    id: 'pb-16', title: 'Wage & Hour Class Action Defense', category: 'Employment', jurisdiction: 'Federal', difficulty: 'High', phases: 12, 
    description: 'Defending collective actions regarding overtime and breaks under FLSA/State laws.', 
    tags: ['Class Action', 'Defense', 'FLSA'], readiness: 100, status: 'Production Ready',
    stages: [
        { name: 'Removal', duration: '30 Days', criticalTasks: ['Remove to Federal Court (CAFA)'] },
        { name: 'Certification', duration: '6-9 Months', criticalTasks: ['Oppose Class Cert', 'Depose Class Reps'] },
        { name: 'Settlement', duration: 'Ongoing', criticalTasks: ['Mediation', 'PAGA Penalties Analysis'] }
    ],
    authorities: [
        { id: 'cit-emp-1', title: 'Wal-Mart v. Dukes', citation: '564 U.S. 338', type: 'Case', relevance: 'Commonality Standard' }
    ],
    warRoomConfig: { recommendedTabs: ['command', 'opposition'], evidenceTags: ['Timecards', 'Policy Manuals'] },
    strategyNotes: 'Defeat commonality. Show individualized inquiry is required for liability.'
  },
  // Adding placeholder data for the rest to ensure valid objects
  ...Array.from({ length: 45 }).map((_, i) => ({
      id: `pb-gen-${i+20}`,
      title: `General Litigation Strategy ${i+1}`,
      category: 'General',
      jurisdiction: 'State',
      difficulty: 'Medium' as const,
      phases: 4,
      description: 'Template for general civil litigation matters.',
      tags: ['Civil', 'General'],
      readiness: 100,
      status: 'Production Ready',
      stages: [{ name: 'Intake', duration: '1 Week', criticalTasks: ['Conflict Check'] }],
      authorities: [{ id: 'cit-gen', title: 'FRCP 1', citation: 'Rule 1', type: 'Rule' as const, relevance: 'Scope' }],
      warRoomConfig: { recommendedTabs: ['command'], evidenceTags: [] },
      strategyNotes: 'Follow standard local rules.'
  }))
];
