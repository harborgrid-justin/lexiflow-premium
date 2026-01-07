/**
 * @module components/enterprise/CRM/BusinessDevelopment/types
 * @description Type definitions for Business Development module
 */

export interface Lead {
  id: string;
  name: string;
  company: string;
  industry: string;
  email: string;
  phone: string;
  source:
    | "Referral"
    | "Website"
    | "Conference"
    | "LinkedIn"
    | "Cold Outreach"
    | "Other";
  status:
    | "New"
    | "Contacted"
    | "Qualified"
    | "Proposal"
    | "Negotiation"
    | "Won"
    | "Lost";
  practiceArea: string;
  estimatedValue: number;
  probability: number;
  assignedTo: string;
  createdDate: string;
  lastActivity: string;
  nextAction?: string;
  nextActionDate?: string;
  notes?: string;
}

export interface Pitch {
  id: string;
  leadId: string;
  clientName: string;
  practiceArea: string;
  pitchDate: string;
  pitchType: "In-Person" | "Virtual" | "Written" | "Panel";
  attendees: string[];
  presenters: string[];
  status: "Scheduled" | "Completed" | "Won" | "Lost";
  followUpDate?: string;
  estimatedValue: number;
  outcome?: "Won" | "Lost" | "No Decision Yet";
  feedbackReceived?: boolean;
  notes?: string;
}

export interface RFP {
  id: string;
  title: string;
  clientName: string;
  industry: string;
  practiceArea: string;
  receivedDate: string;
  dueDate: string;
  estimatedValue: number;
  status:
    | "Reviewing"
    | "Go/No-Go"
    | "In Progress"
    | "Submitted"
    | "Won"
    | "Lost"
    | "Declined";
  teamLead: string;
  contributors: string[];
  progress: number;
  sections: RFPSection[];
  questions?: number;
  pageLimit?: number;
  goNoGoDecision?: "Go" | "No-Go" | "Pending";
  goNoGoReason?: string;
}

export interface RFPSection {
  name: string;
  assignedTo: string;
  status: "Not Started" | "In Progress" | "Review" | "Complete";
}

export interface WinLossAnalysis {
  id: string;
  opportunityName: string;
  clientName: string;
  practiceArea: string;
  estimatedValue: number;
  actualValue?: number;
  outcome: "Won" | "Lost";
  closeDate: string;
  winReasons?: string[];
  lossReasons?: string[];
  competitorWon?: string;
  lessonsLearned: string[];
  teamMembers: string[];
  salesCycle: number;
}

export type TabType = "leads" | "pitches" | "rfps" | "analysis";
