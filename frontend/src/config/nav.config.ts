/**
 * Navigation Configuration
 *
 * Centralized navigation items configuration for the application sidebar.
 * Includes icons, labels, categories, and permission requirements.
 */

import {
  AlertTriangle,
  BarChart3,
  Book,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  Database,
  DollarSign,
  FileCheck,
  FilePlus,
  FileQuestion,
  FileSpreadsheet,
  FileText,
  Fingerprint,
  Gavel,
  GitBranch,
  Globe,
  Home,
  LayoutDashboard,
  LayoutGrid,
  Library,
  type LucideIcon,
  MapPin,
  MessageSquare,
  Milestone,
  Network,
  Package,
  Palette,
  PenTool,
  PieChart,
  Receipt,
  ScrollText,
  Search,
  Send,
  Settings,
  Share2,
  ShieldCheck,
  ShoppingCart,
  StickyNote,
  Target,
  Trash2,
  UserCog,
  Users,
} from "lucide-react";

import { type AppView, type NavCategory } from "@/types";

import { PATHS } from "./paths.config";

export interface NavItemConfig {
  id: AppView;
  label: string;
  icon: LucideIcon;
  category: NavCategory;
  requiresAdmin?: boolean;
  requiresAttorney?: boolean;
  requiresStaff?: boolean;
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
  {
    id: PATHS.DASHBOARD,
    label: "Dashboard",
    icon: LayoutDashboard,
    category: "Main",
  },
  {
    id: PATHS.CALENDAR,
    label: "Master Calendar",
    icon: Calendar,
    category: "Main",
  },
  {
    id: PATHS.MESSAGES,
    label: "Secure Messenger",
    icon: MessageSquare,
    category: "Main",
  },
  {
    id: PATHS.PROFILE,
    label: "My Profile",
    icon: Users,
    category: "Main",
  },
  {
    id: PATHS.SETTINGS,
    label: "Settings",
    icon: Settings,
    category: "Main",
  },
  {
    id: PATHS.THEME,
    label: "Theme Settings",
    icon: Palette,
    category: "Main",
  },

  // ============================================================================
  // CASE WORK - Case Management & Documents
  // ============================================================================
  {
    id: PATHS.CASES,
    label: "Case Management",
    icon: Briefcase,
    category: "Case Work",
    children: [
      { id: PATHS.CASES_OVERVIEW, label: "Overview", icon: LayoutGrid },
      { id: PATHS.CASES_CALENDAR, label: "Calendar", icon: Calendar },
      { id: PATHS.CASES_ANALYTICS, label: "Analytics", icon: BarChart3 },
      { id: PATHS.CASES_INTAKE, label: "Intake", icon: FilePlus },
      { id: PATHS.CASES_OPERATIONS, label: "Operations", icon: GitBranch },
      { id: PATHS.CASES_INSIGHTS, label: "Insights", icon: Search },
      { id: PATHS.CASES_FINANCIALS, label: "Financials", icon: DollarSign },
    ],
  },
  {
    id: PATHS.PLEADINGS,
    label: "Pleadings",
    icon: ScrollText,
    category: "Case Work",
  },
  {
    id: PATHS.DOCKET,
    label: "Docket & Filings",
    icon: BookOpen,
    category: "Case Work",
  },
  {
    id: PATHS.DOCUMENTS,
    label: "Document Manager",
    icon: FileText,
    category: "Case Work",
  },
  {
    id: PATHS.DRAFTING,
    label: "Drafting & Assembly",
    icon: PenTool,
    category: "Case Work",
  },
  {
    id: PATHS.CORRESPONDENCE,
    label: "Correspondence",
    icon: Send,
    category: "Case Work",
  },
  {
    id: PATHS.PLEADING_BUILDER,
    label: "Pleading Builder",
    icon: PenTool,
    category: "Case Work",
  },
  {
    id: PATHS.LITIGATION,
    label: "Litigation Matters",
    icon: Gavel,
    category: "Case Work",
  },
  {
    id: PATHS.LITIGATION_BUILDER,
    label: "Litigation Strategy",
    icon: Milestone,
    category: "Case Work",
  },
  {
    id: PATHS.WORKFLOWS,
    label: "Case Workflows",
    icon: GitBranch,
    category: "Case Work",
  },

  // ============================================================================
  // LITIGATION TOOLS - Discovery, Evidence & Trial Prep
  // ============================================================================
  {
    id: PATHS.RESEARCH,
    label: "Research",
    icon: Search,
    category: "Litigation Tools",
  },
  {
    id: PATHS.CITATIONS,
    label: "Citations",
    icon: ScrollText,
    category: "Litigation Tools",
  },
  {
    id: PATHS.WAR_ROOM,
    label: "War Room",
    icon: Target,
    category: "Litigation Tools",
  },
  {
    id: PATHS.DISCOVERY,
    label: "Discovery Center",
    icon: FileQuestion,
    category: "Litigation Tools",
    children: [
      { id: PATHS.DISCOVERY_REQUESTS, label: "Requests", icon: FilePlus },
      { id: PATHS.DISCOVERY_RESPONSES, label: "Responses", icon: FileCheck },
      { id: PATHS.DISCOVERY_PRODUCTIONS, label: "Productions", icon: Package },
      { id: PATHS.DISCOVERY_TIMELINE, label: "Timeline", icon: Calendar },
    ],
  },
  {
    id: PATHS.EVIDENCE,
    label: "Evidence Vault",
    icon: Fingerprint,
    category: "Litigation Tools",
  },
  {
    id: PATHS.EXHIBITS,
    label: "Exhibit Pro",
    icon: StickyNote,
    category: "Litigation Tools",
  },
  {
    id: PATHS.TRIAL,
    label: "Trial Management",
    icon: Gavel,
    category: "Litigation Tools",
    children: [
      { id: PATHS.TRIAL_CALENDAR, label: "Trial Calendar", icon: Calendar },
      { id: PATHS.TRIAL_WITNESSES, label: "Witnesses", icon: Users },
      { id: PATHS.TRIAL_EXHIBITS, label: "Trial Exhibits", icon: FileText },
      { id: PATHS.TRIAL_MOTIONS, label: "Motions in Limine", icon: ScrollText },
      { id: PATHS.TRIAL_NOTES, label: "Trial Notes", icon: StickyNote },
    ],
  },

  // ============================================================================
  // OPERATIONS - Firm Management & Business
  // ============================================================================
  {
    id: PATHS.DAF,
    label: "DAF Operations",
    icon: ShieldCheck,
    category: "Operations",
  },
  {
    id: PATHS.DATA_PLATFORM,
    label: "Data Platform",
    icon: Database,
    category: "Operations",
  },
  {
    id: PATHS.ENTITIES,
    label: "Entity Director",
    icon: Network,
    category: "Operations",
  },
  {
    id: PATHS.PRACTICE,
    label: "Practice Areas",
    icon: Building2,
    category: "Operations",
  },
  {
    id: PATHS.BILLING,
    label: "Billing & Finance",
    icon: DollarSign,
    category: "Operations",
  },
  {
    id: PATHS.CRM,
    label: "Client CRM",
    icon: Users,
    category: "Operations",
  },
  {
    id: PATHS.REPORTS,
    label: "Reports",
    icon: FileSpreadsheet,
    category: "Operations",
  },
  {
    id: PATHS.ANALYTICS,
    label: "Analytics",
    icon: BarChart3,
    category: "Operations",
  },

  // ============================================================================
  // KNOWLEDGE - Reference & Templates
  // ============================================================================
  {
    id: PATHS.LIBRARY,
    label: "Knowledge Base",
    icon: Library,
    category: "Knowledge",
  },
  {
    id: PATHS.CLAUSES,
    label: "Clause Library",
    icon: Book,
    category: "Knowledge",
  },
  {
    id: PATHS.JURISDICTION,
    label: "Jurisdictions",
    icon: Globe,
    category: "Knowledge",
  },
  {
    id: PATHS.RULES_ENGINE,
    label: "Rules Engine",
    icon: Gavel,
    category: "Knowledge",
  },

  // ============================================================================
  // REAL ESTATE DIVISION - Property & Asset Management
  // ============================================================================
  {
    id: PATHS.REAL_ESTATE,
    label: "Real Estate Division",
    icon: Home,
    category: "Operations",
    children: [
      // Portfolio Management
      {
        id: PATHS.RE_PORTFOLIO_SUMMARY,
        label: "Portfolio Summary",
        icon: LayoutGrid,
      },
      { id: PATHS.RE_INVENTORY, label: "Inventory (RPUID)", icon: Package },
      {
        id: PATHS.RE_UTILIZATION,
        label: "Utilization Analytics",
        icon: PieChart,
      },

      // Transactions
      { id: PATHS.RE_OUTGRANTS, label: "Outgrants & Revenue", icon: Receipt },
      {
        id: PATHS.RE_SOLICITATIONS,
        label: "Solicitations",
        icon: FileSpreadsheet,
      },
      { id: PATHS.RE_RELOCATION, label: "Relocation", icon: MapPin },
      { id: PATHS.RE_COST_SHARE, label: "Cost Share Programs", icon: Share2 },
      { id: PATHS.RE_DISPOSAL, label: "Disposal Actions", icon: Trash2 },
      {
        id: PATHS.RE_ACQUISITION,
        label: "Land Acquisition",
        icon: ShoppingCart,
      },
      { id: PATHS.RE_ENCROACHMENT, label: "Encroachment", icon: AlertTriangle },

      // Administration
      { id: PATHS.RE_USER_MGMT, label: "User Management", icon: UserCog },
      { id: PATHS.RE_AUDIT, label: "Audit Readiness (CFI)", icon: FileCheck },
    ],
  },

  // ============================================================================
  // ADMIN - System Administration (Admin-Only)
  // ============================================================================
  {
    id: PATHS.COMPLIANCE,
    label: "Compliance",
    icon: ShieldCheck,
    category: "Admin",
    requiresAdmin: true,
  },
  {
    id: PATHS.AUDIT,
    label: "Audit Logs",
    icon: FileCheck,
    category: "Admin",
    requiresAdmin: true,
  },
  {
    id: PATHS.ADMIN,
    label: "Admin Console",
    icon: Settings,
    category: "Admin",
    requiresAdmin: true,
  },
];
