
import { 
  LayoutDashboard, Briefcase, FileText, Search, ShieldCheck, Scale, 
  Calendar, Book, DollarSign, Users, BarChart3, Settings, 
  FileQuestion, Fingerprint, MessageSquare, Globe, GitBranch, 
  ScrollText, BookOpen, Building2, Palette, Zap 
} from 'lucide-react';
import { AppView, NavCategory } from '../types.ts';

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
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'Main' },
  { id: 'calendar', label: 'Master Calendar', icon: Calendar, category: 'Main' },
  { id: 'messages', label: 'Secure Messenger', icon: MessageSquare, category: 'Main' },

  // CASE WORK
  { id: 'cases', label: 'Case Management', icon: Briefcase, category: 'Case Work' },
  { id: 'docket', label: 'Master Docket', icon: BookOpen, category: 'Case Work' },
  { id: 'workflows', label: 'Workflows & Process', icon: GitBranch, category: 'Case Work' },
  { id: 'documents', label: 'Documents', icon: FileText, category: 'Case Work' },

  // LITIGATION TOOLS
  { id: 'discovery', label: 'Discovery Center', icon: FileQuestion, category: 'Litigation Tools' },
  { id: 'evidence', label: 'Evidence Vault', icon: Fingerprint, category: 'Litigation Tools' },
  { id: 'jurisdiction', label: 'Jurisdiction & Venues', icon: Globe, category: 'Litigation Tools' },
  { id: 'research', label: 'Legal Research', icon: Search, category: 'Litigation Tools' },

  // OPERATIONS
  { id: 'practice', label: 'Firm Operations', icon: Building2, category: 'Operations' },
  { id: 'billing', label: 'Billing & Finance', icon: DollarSign, category: 'Operations' },
  { id: 'crm', label: 'Client CRM', icon: Users, category: 'Operations' },

  // KNOWLEDGE
  { id: 'library', label: 'Knowledge Base', icon: Book, category: 'Knowledge' },
  { id: 'clauses', label: 'Clause Library', icon: ScrollText, category: 'Knowledge' },
  { id: 'analytics', label: 'Analytics & Prediction', icon: BarChart3, category: 'Knowledge' },

  // ADMIN
  { id: 'compliance', label: 'Risk & Compliance', icon: ShieldCheck, category: 'Admin', requiresAdmin: true },
  { id: 'admin', label: 'Admin & Security', icon: Settings, category: 'Admin', requiresAdmin: true },
  { id: 'theme', label: 'Theme Explorer', icon: Zap, category: 'Admin', requiresAdmin: true },
  { id: 'design', label: 'Design System', icon: Palette, category: 'Admin', requiresAdmin: true },
];
