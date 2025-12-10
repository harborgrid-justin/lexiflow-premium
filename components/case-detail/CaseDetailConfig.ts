
import { LayoutDashboard, Users, Clock, Lightbulb, Calendar, Briefcase, CheckSquare, MessageSquare, Gavel, Search, Fingerprint, FileText, Folder, PenTool, FileSearch, DollarSign, Target, ShieldAlert, Layers, Box, StickyNote } from 'lucide-react';

export const CASE_DETAIL_TABS = [
  {
    id: 'overview', label: 'Overview', icon: LayoutDashboard,
    subTabs: [
      { id: 'Overview', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'Parties', label: 'Parties', icon: Users },
      { id: 'Timeline', label: 'Timeline', icon: Clock },
    ]
  },
  {
    id: 'strategy', label: 'Strategy', icon: Lightbulb,
    subTabs: [
      { id: 'Research', label: 'Research', icon: Search },
      { id: 'Arguments', label: 'Argument Builder', icon: Target },
      { id: 'Risk', label: 'Risk Assessment', icon: ShieldAlert },
      { id: 'Strategy', label: 'Authority & Defenses', icon: Layers },
      { id: 'Planning', label: 'Case Plan', icon: Calendar },
    ]
  },
  {
    id: 'execution', label: 'Execution', icon: Briefcase,
    subTabs: [
      { id: 'Projects', label: 'Projects', icon: Briefcase },
      { id: 'Workflow', label: 'Tasks', icon: CheckSquare },
      { id: 'Collaboration', label: 'Collaboration', icon: MessageSquare },
    ]
  },
  {
    id: 'litigation', label: 'Litigation', icon: Gavel,
    subTabs: [
      { id: 'Motions', label: 'Motions', icon: Gavel },
      { id: 'Discovery', label: 'Discovery', icon: FileSearch },
      { id: 'Evidence', label: 'Evidence Vault', icon: Fingerprint },
      { id: 'Exhibits', label: 'Exhibits', icon: StickyNote },
    ]
  },
  {
    id: 'docs', label: 'Documents', icon: FileText,
    subTabs: [
      { id: 'Documents', label: 'Files', icon: Folder },
      { id: 'Drafting', label: 'Drafting', icon: PenTool },
      { id: 'Contract Review', label: 'Review', icon: FileSearch },
    ]
  },
  {
    id: 'finance', label: 'Finance', icon: DollarSign,
    subTabs: [
      { id: 'Billing', label: 'Billing', icon: DollarSign },
    ]
  }
];
