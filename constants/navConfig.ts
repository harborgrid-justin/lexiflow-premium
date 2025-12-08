
import { 
  LayoutDashboard, Briefcase, FileText, Search, ShieldCheck, Scale, 
  Calendar, Book, DollarSign, Users, BarChart3, Settings, 
  FileQuestion, Fingerprint, MessageSquare, Globe, GitBranch, 
  ScrollText, BookOpen, Building2, Target, StickyNote, Send, Library, Gavel, Network, Database, UserCircle, PenTool
} from 'lucide-react';
import { AppView, NavCategory } from '../types';
import { PATHS } from './paths';

export interface NavItemConfig {
  id: AppView;
  label: string;
  icon: any;
  category: NavCategory;
  requiresAdmin?: boolean;
}

// Centralized Navigation Configuration
export const NAVIGATION_ITEMS: NavItemConfig[] = [
  // MAIN
  { id: PATHS.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard, category: 'Main' },
  { id: PATHS.CALENDAR, label: 'Master Calendar', icon: Calendar, category: 'Main' },
  { id: PATHS.MESSAGES, label: 'Secure Messenger', icon: MessageSquare, category: 'Main' },

  // CASE WORK
  { id: PATHS.CASES, label: 'Case Management', icon: Briefcase, category: 'Case Work' },
  { id: PATHS.PLEADING_BUILDER, label: 'Pleading Builder', icon: PenTool, category: 'Case Work' },
  { id: PATHS.DOCKET, label: 'Master Docket', icon: BookOpen, category: 'Case Work' },
  { id: PATHS.DOCUMENTS, label: 'Documents', icon: FileText, category: 'Case Work' },
  { id: PATHS.CORRESPONDENCE, label: 'Correspondence', icon: Send, category: 'Case Work' },
  { id: PATHS.WORKFLOWS, label: 'Workflows', icon: GitBranch, category: 'Case Work' },

  // LITIGATION TOOLS
  { id: PATHS.RESEARCH, label: 'Research & Knowledge', icon: Search, category: 'Litigation Tools' },
  { id: PATHS.WAR_ROOM, label: 'War Room', icon: Target, category: 'Litigation Tools' },
  { id: PATHS.DISCOVERY, label: 'Discovery Center', icon: FileQuestion, category: 'Litigation Tools' },
  { id: PATHS.EVIDENCE, label: 'Evidence Vault', icon: Fingerprint, category: 'Litigation Tools' },
  { id: PATHS.EXHIBITS, label: 'Exhibit Pro', icon: StickyNote, category: 'Litigation Tools' },
  
  // OPERATIONS
  { id: PATHS.DATA_PLATFORM, label: 'Data Platform', icon: Database, category: 'Operations' },
  { id: PATHS.ENTITIES, label: 'Entity Director', icon: Network, category: 'Operations' },
  { id: PATHS.PRACTICE, label: 'Firm Operations', icon: Building2, category: 'Operations' },
  { id: PATHS.BILLING, label: 'Billing & Finance', icon: DollarSign, category: 'Operations' },
  { id: PATHS.CRM, label: 'Client CRM', icon: Users, category: 'Operations' },

  // ADMIN
  { id: PATHS.COMPLIANCE, label: 'Compliance', icon: ShieldCheck, category: 'Admin', requiresAdmin: true },
  { id: PATHS.ADMIN, label: 'Admin Console', icon: Settings, category: 'Admin', requiresAdmin: true },
  
  // PROFILE (Can be in Admin or its own invisible category if handled by user menu, but adding here for completeness)
  { id: PATHS.PROFILE, label: 'My Profile', icon: UserCircle, category: 'Main' },
];
