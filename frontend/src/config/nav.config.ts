/**
 * Navigation Configuration
 * 
 * Centralized navigation items configuration for the application sidebar.
 * Includes icons, labels, categories, and permission requirements.
 */

import {
  LayoutDashboard, Briefcase, FileText, Search, ShieldCheck, Scale,
  Calendar, Book, DollarSign, Users, BarChart3, Settings,
  FileQuestion, Fingerprint, MessageSquare, Globe, GitBranch,
  ScrollText, BookOpen, Building2, Target, StickyNote, Send, Library, Gavel, Network, Database, UserCircle, PenTool, Milestone, LucideIcon,
  Lightbulb, TrendingUp, LayoutGrid, ClipboardCheck, Wallet, FolderKanban
} from 'lucide-react';
import { AppView, NavCategory } from '../types';
import { PATHS } from './paths.config';

export interface NavItemConfig {
  id: AppView;
  label: string;
  icon: LucideIcon;
  category: NavCategory;
  requiresAdmin?: boolean;
  children?: { id: AppView; label: string; icon: LucideIcon }[];
}

/**
 * Centralized Navigation Configuration
 * Defines all navigation items for the application sidebar
 * 
 * Categories:
 * - Main: Core application functions (Dashboard, Calendar, Messenger)
 * - Case Work: Matter management, documents, filings, and case workflows
 * - Litigation Tools: Discovery, evidence, research, and trial preparation
 * - Operations: Firm management, billing, CRM, and data platforms
 * - Knowledge: Reference materials, templates, and rule engines
 * - Admin: System administration (admin-only access)
 */
export const NAVIGATION_ITEMS: NavItemConfig[] = [
  // ============================================================================
  // MAIN - Core Application Functions
  // ============================================================================
  { id: PATHS.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard, category: 'Main' },
  { id: PATHS.CALENDAR, label: 'Master Calendar', icon: Calendar, category: 'Main' },
  { id: PATHS.MESSAGES, label: 'Secure Messenger', icon: MessageSquare, category: 'Main' },

  // ============================================================================
  // CASE WORK - Case Management & Documents
  // ============================================================================
  { 
    id: PATHS.CASES, 
    label: 'Case Management', 
    icon: Briefcase, 
    category: 'Case Work'
  },
  { id: PATHS.DOCKET, label: 'Docket & Filings', icon: BookOpen, category: 'Case Work' },
  { id: PATHS.DOCUMENTS, label: 'Document Manager', icon: FileText, category: 'Case Work' },
  { id: PATHS.DRAFTING, label: 'Drafting & Assembly', icon: PenTool, category: 'Case Work' },
  { id: PATHS.CORRESPONDENCE, label: 'Correspondence', icon: Send, category: 'Case Work' },
  { id: PATHS.PLEADING_BUILDER, label: 'Pleading Builder', icon: PenTool, category: 'Case Work' },
  { id: PATHS.LITIGATION_BUILDER, label: 'Litigation Strategy', icon: Milestone, category: 'Case Work' },
  { id: PATHS.WORKFLOWS, label: 'Case Workflows', icon: GitBranch, category: 'Case Work' },

  // ============================================================================
  // LITIGATION TOOLS - Discovery, Evidence & Trial Prep
  // ============================================================================
  { id: PATHS.RESEARCH, label: 'Research', icon: Search, category: 'Litigation Tools' },
  { id: PATHS.CITATIONS, label: 'Citations', icon: ScrollText, category: 'Litigation Tools' },
  { id: PATHS.WAR_ROOM, label: 'War Room', icon: Target, category: 'Litigation Tools' },
  { id: PATHS.DISCOVERY, label: 'Discovery Center', icon: FileQuestion, category: 'Litigation Tools' },
  { id: PATHS.EVIDENCE, label: 'Evidence Vault', icon: Fingerprint, category: 'Litigation Tools' },
  { id: PATHS.EXHIBITS, label: 'Exhibit Pro', icon: StickyNote, category: 'Litigation Tools' },
  
  // ============================================================================
  // OPERATIONS - Firm Management & Business
  // ============================================================================
  { id: PATHS.DAF, label: 'DAF Operations', icon: ShieldCheck, category: 'Operations' },
  { id: PATHS.DATA_PLATFORM, label: 'Data Platform', icon: Database, category: 'Operations' },
  { id: PATHS.ENTITIES, label: 'Entity Director', icon: Network, category: 'Operations' },
  { id: PATHS.PRACTICE, label: 'Firm Operations', icon: Building2, category: 'Operations' },
  { id: PATHS.BILLING, label: 'Billing & Finance', icon: DollarSign, category: 'Operations' },
  { id: PATHS.CRM, label: 'Client CRM', icon: Users, category: 'Operations' },
  { id: PATHS.ANALYTICS, label: 'Analytics', icon: BarChart3, category: 'Operations' },

  // ============================================================================
  // KNOWLEDGE - Reference & Templates
  // ============================================================================
  { id: PATHS.LIBRARY, label: 'Knowledge Base', icon: Library, category: 'Knowledge' },
  { id: PATHS.CLAUSES, label: 'Clause Library', icon: Book, category: 'Knowledge' },
  { id: PATHS.JURISDICTION, label: 'Jurisdictions', icon: Globe, category: 'Knowledge' },
  { id: PATHS.RULES_ENGINE, label: 'Rules Engine', icon: Gavel, category: 'Knowledge' },

  // ============================================================================
  // ADMIN - System Administration (Admin-Only)
  // ============================================================================
  { id: PATHS.COMPLIANCE, label: 'Compliance', icon: ShieldCheck, category: 'Admin', requiresAdmin: true },
  { id: PATHS.ADMIN, label: 'Admin Console', icon: Settings, category: 'Admin', requiresAdmin: true },
];
