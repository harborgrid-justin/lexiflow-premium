/**
 * constants.ts
 * 
 * Shared constants for the Litigation module.
 * 
 * @module components/litigation/constants
 */

import { 
  GitMerge, Milestone, FileText, Play, 
  Gavel, Scale, AlertTriangle, Flag, Mic2, Search, Users, 
  MessageSquare, ScrollText, ClipboardCheck, ArrowUpRightSquare 
} from 'lucide-react';

// Re-export canvas constants for backward compatibility
export * from './strategy/canvasConstants';

export const LITIGATION_TABS = [
  {
    id: 'design', label: 'Strategy Design', icon: GitMerge,
    subTabs: [
      { id: 'canvas', label: 'Visual Map', icon: GitMerge },
      { id: 'timeline', label: 'Gantt View', icon: Milestone },
      { id: 'templates', label: 'Playbooks', icon: FileText },
    ]
  },
  {
    id: 'analysis', label: 'Analysis', icon: Play,
    subTabs: [
      { id: 'simulate', label: 'Outcome Simulator', icon: Play },
    ]
  }
];

export const PALETTE_SECTIONS = [
  {
      title: 'Macro Phases (Boundaries)',
      items: [
          { label: 'Pleading Phase', type: 'Phase', icon: FileText, desc: 'Complaint to Answer' },
          { label: 'Discovery Phase', type: 'Phase', icon: Search, desc: 'Fact & Expert Discovery' },
          { label: 'Pre-Trial Phase', type: 'Phase', icon: Scale, desc: 'Dispositive Motions' },
          { label: 'Trial Phase', type: 'Phase', icon: Gavel, desc: 'Voir Dire to Verdict' },
      ]
  },
   {
      title: 'Case Milestones & Events',
      items: [
          { label: 'Complaint Filed', type: 'Start', icon: Milestone, desc: 'Initiation of Lawsuit' },
          { label: 'Answer Due', type: 'Event', icon: Milestone, desc: 'Deadline for Response' },
          { label: 'Discovery Cutoff', type: 'Event', icon: Milestone, desc: 'End of Discovery Period' },
          { label: 'Trial Date', type: 'Event', icon: Gavel, desc: 'Scheduled Trial Start' },
      ]
  },
  {
      title: 'Dispositive Motions',
      items: [
          { label: 'Rule 12(b)(6)', type: 'Decision', icon: Scale, desc: 'Motion to Dismiss' },
          { label: 'Rule 56', type: 'Decision', icon: FileText, desc: 'Summary Judgment' },
          { label: 'Rule 12(c)', type: 'Decision', icon: FileText, desc: 'Judgment on Pleadings' },
          { label: 'Rule 11', type: 'Decision', icon: AlertTriangle, desc: 'Sanctions Motion' },
      ]
  },
  {
      title: 'Discovery & Procedural Tools',
      items: [
          { label: 'Rule 26(f) Conference', type: 'Task', icon: ClipboardCheck, desc: 'Initial Discovery Plan' },
          { label: 'Deposition', type: 'Task', icon: Mic2, desc: 'Oral Testimony' },
          { label: 'Interrogatories', type: 'Task', icon: FileText, desc: 'Written Questions' },
          { label: 'Request for Admission', type: 'Task', icon: ClipboardCheck, desc: 'Fact Admissions' },
          { label: 'Subpoena', type: 'Task', icon: ScrollText, desc: 'Third-Party Discovery' },
      ]
  },
  {
      title: 'ADR & Settlement',
      items: [
          { label: 'Mediation', type: 'Event', icon: MessageSquare, desc: 'Third-party resolution' },
          { label: 'Settlement Conf', type: 'Event', icon: Users, desc: 'Judicial Conference' },
          { label: 'Offer of Judgment', type: 'Decision', icon: FileText, desc: 'Rule 68 Offer' },
      ]
  },
  {
      title: 'Trial & Post-Trial',
      items: [
          { label: 'Motion in Limine', type: 'Decision', icon: Gavel, desc: 'Exclude Evidence' },
          { label: 'Rule 50', type: 'Decision', icon: AlertTriangle, desc: 'Directed Verdict' },
          { label: 'Rule 59', type: 'Decision', icon: Flag, desc: 'Motion for New Trial' },
      ]
  },
  {
      title: 'Appellate Procedure',
      items: [
          { label: 'Notice of Appeal', type: 'End', icon: ArrowUpRightSquare, desc: 'Initiate Appeal' },
          { label: 'Appellant\'s Brief', type: 'Task', icon: FileText, desc: 'Opening Brief' },
          { label: 'Appellee\'s Brief', type: 'Task', icon: FileText, desc: 'Response Brief' },
          { label: 'Oral Argument', type: 'Event', icon: Mic2, desc: 'Appellate Hearing' },
      ]
  }
];

export const LITIGATION_DESCRIPTIONS: Record<string, string> = {
  'Rule 12(b)(6)': 'Motion to Dismiss for failure to state a claim. Standard: Assuming all facts true, plaintiff cannot win.',
  'Rule 56': 'Summary Judgment. Standard: No genuine dispute of material fact.',
  'Rule 50': 'Directed Verdict / Judgment as a Matter of Law.',
};
