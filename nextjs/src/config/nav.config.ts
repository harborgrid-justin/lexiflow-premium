/**
 * Navigation Configuration
 *
 * Centralized navigation items configuration for the application sidebar.
 * Includes icons, labels, categories, and permission requirements.
 */

import { AppView, NavCategory } from "@/types";
import {
  AlertTriangle,
  Archive,
  Banknote,
  BarChart3,
  Bell,
  Book,
  BookOpen,
  Briefcase,
  Building,
  Building2,
  Calendar,
  CheckSquare,
  Clock,
  CreditCard,
  Database,
  DollarSign,
  DoorOpen,
  FileArchive,
  FileBarChart,
  FileCheck,
  FileEdit,
  FileQuestion,
  FileSignature,
  FileSpreadsheet,
  FileText,
  Fingerprint,
  FolderOpen,
  Gavel,
  GitBranch,
  Globe,
  Handshake,
  History,
  LayoutDashboard,
  Library,
  Lock,
  LucideIcon,
  Mail,
  Megaphone,
  MessageSquare,
  Network,
  PenTool,
  PieChart,
  Plug,
  Receipt,
  Scale,
  ScrollText,
  Search,
  Send,
  Settings,
  ShieldCheck,
  StickyNote,
  Target,
  Trash2,
  Truck,
  UserCheck,
  UserCog,
  UserPlus,
  Users,
  Wrench,
} from "lucide-react";
import { PATHS } from "./paths.config";

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
 * Enterprise-Grade Categories (Aligned with 8 PRIMARY Business Domains):
 * - Core: Essential daily functions (Dashboard, Calendar, Messenger)
 * - Matters: Matter Lifecycle Management (Intake → Strategy → Tracking → Closure)
 * - Research: Legal Research & Intelligence (Case Law, Statutes, Citations, Analytics)
 * - Discovery: Discovery & Evidence Management (E-Discovery, Chain-of-Custody, Production)
 * - Documents: Document Management & Automation (Lifecycle, Pleadings, Clauses, Versions)
 * - Litigation: Litigation & Trial Management (Strategy, Motions, War Room, Trial Prep)
 * - Operations: Firm Operations & Administration (Billing, CRM, Compliance, HR)
 * - Intelligence: Analytics & Business Intelligence (Performance, Financials, Predictive)
 * - Admin: System Administration (Admin-only access)
 *
 * @see business-flows/00-ENTERPRISE-TAXONOMY-INDEX.md for detailed taxonomy
 */
export const NAVIGATION_ITEMS: NavItemConfig[] = [
  // ============================================================================
  // CORE - Essential Daily Functions
  // ============================================================================
  {
    id: PATHS.DASHBOARD,
    label: "Dashboard",
    icon: LayoutDashboard,
    category: "Core",
  },
  {
    id: PATHS.CALENDAR,
    label: "Master Calendar",
    icon: Calendar,
    category: "Core",
  },
  {
    id: PATHS.MESSAGES,
    label: "Secure Messenger",
    icon: MessageSquare,
    category: "Core",
  },
  {
    id: PATHS.NOTIFICATIONS,
    label: "Notifications",
    icon: Bell,
    category: "Core",
  },
  {
    id: PATHS.TASKS,
    label: "Tasks",
    icon: CheckSquare,
    category: "Core",
  },

  // ============================================================================
  // PRIMARY 01: MATTER LIFECYCLE MANAGEMENT
  // ============================================================================
  {
    id: PATHS.CASES,
    label: "Matter Management",
    icon: Briefcase,
    category: "Matters",
    children: [
      { id: PATHS.CASES, label: "All Matters", icon: Briefcase },
      { id: PATHS.INTAKE_FORMS, label: "Matter Intake", icon: FileEdit },
      { id: PATHS.CONFLICTS, label: "Conflict Checking", icon: AlertTriangle },
      { id: PATHS.ENGAGEMENT_LETTERS, label: "Engagement Letters", icon: Mail },
    ],
  },
  {
    id: PATHS.LITIGATION_BUILDER,
    label: "Case Strategy",
    icon: Target,
    category: "Matters",
  },
  {
    id: PATHS.WORKFLOWS,
    label: "Matter Workflows",
    icon: GitBranch,
    category: "Matters",
  },
  {
    id: PATHS.DEADLINES,
    label: "Deadline Management",
    icon: AlertTriangle,
    category: "Matters",
  },

  // ============================================================================
  // PRIMARY 02: LEGAL RESEARCH & INTELLIGENCE
  // ============================================================================
  {
    id: PATHS.RESEARCH,
    label: "Legal Research",
    icon: Search,
    category: "Research",
    children: [
      { id: PATHS.RESEARCH, label: "Case Law Research", icon: Search },
      {
        id: PATHS.STATUTE_TRACKER,
        label: "Statutory Research",
        icon: BookOpen,
      },
      { id: PATHS.CITATIONS, label: "Citation Management", icon: ScrollText },
      { id: PATHS.LIBRARY, label: "Knowledge Base", icon: Library },
    ],
  },
  {
    id: PATHS.JURISDICTION,
    label: "Jurisdictions",
    icon: Globe,
    category: "Research",
  },
  {
    id: PATHS.RULES_ENGINE,
    label: "Rules Engine",
    icon: Gavel,
    category: "Research",
  },

  // ============================================================================
  // PRIMARY 03: DISCOVERY & EVIDENCE MANAGEMENT
  // ============================================================================
  {
    id: PATHS.DISCOVERY,
    label: "Discovery Center",
    icon: FileQuestion,
    category: "Discovery",
    children: [
      { id: PATHS.DISCOVERY, label: "Discovery Dashboard", icon: FileQuestion },
      {
        id: PATHS.INTERROGATORIES,
        label: "Interrogatories",
        icon: FileQuestion,
      },
      { id: PATHS.ADMISSIONS, label: "Admissions", icon: CheckSquare },
      {
        id: PATHS.PRODUCTION_REQUESTS,
        label: "Production Requests",
        icon: FileArchive,
      },
      { id: PATHS.SUBPOENAS, label: "Subpoenas", icon: ScrollText },
      { id: PATHS.DEPOSITIONS, label: "Depositions", icon: FileEdit },
    ],
  },
  {
    id: PATHS.EVIDENCE,
    label: "Evidence Vault",
    icon: Fingerprint,
    category: "Discovery",
    children: [
      { id: PATHS.EVIDENCE, label: "Evidence Dashboard", icon: Fingerprint },
      { id: PATHS.CUSTODIANS, label: "Custodians", icon: UserCheck },
      { id: PATHS.LEGAL_HOLDS, label: "Legal Holds", icon: Lock },
      { id: PATHS.EXHIBITS, label: "Exhibit Manager", icon: StickyNote },
    ],
  },

  // ============================================================================
  // PRIMARY 04: DOCUMENT MANAGEMENT & AUTOMATION
  // ============================================================================
  {
    id: PATHS.DOCUMENTS,
    label: "Document Manager",
    icon: FileText,
    category: "Documents",
    children: [
      { id: PATHS.DOCUMENTS, label: "All Documents", icon: FileText },
      { id: PATHS.DOCUMENT_VERSIONS, label: "Version Control", icon: History },
      { id: PATHS.DOCUMENT_APPROVALS, label: "Approvals", icon: FileCheck },
      { id: PATHS.TEMPLATES, label: "Templates", icon: FolderOpen },
    ],
  },
  {
    id: PATHS.DRAFTING,
    label: "Document Assembly",
    icon: PenTool,
    category: "Documents",
    children: [
      { id: PATHS.DRAFTING, label: "Drafting Studio", icon: PenTool },
      {
        id: PATHS.PLEADING_BUILDER,
        label: "Pleading Builder",
        icon: FileSignature,
      },
      { id: PATHS.CLAUSES, label: "Clause Library", icon: Book },
    ],
  },
  {
    id: PATHS.DOCKET,
    label: "Docket & Filings",
    icon: BookOpen,
    category: "Documents",
  },
  {
    id: PATHS.CORRESPONDENCE,
    label: "Correspondence",
    icon: Send,
    category: "Documents",
  },

  // ============================================================================
  // PRIMARY 05: LITIGATION & TRIAL MANAGEMENT
  // ============================================================================
  {
    id: PATHS.WAR_ROOM,
    label: "War Room",
    icon: Target,
    category: "Litigation",
  },
  {
    id: PATHS.MOTIONS,
    label: "Motion Practice",
    icon: FileSignature,
    category: "Litigation",
    children: [
      { id: PATHS.MOTIONS, label: "All Motions", icon: FileSignature },
      { id: PATHS.BRIEFS, label: "Briefs", icon: FileText },
      { id: PATHS.COURT_DATES, label: "Court Dates", icon: Calendar },
    ],
  },
  {
    id: PATHS.WITNESSES,
    label: "Witnesses",
    icon: Users,
    category: "Litigation",
    children: [
      { id: PATHS.WITNESSES, label: "Fact Witnesses", icon: Users },
      { id: PATHS.EXPERT_WITNESSES, label: "Expert Witnesses", icon: UserPlus },
    ],
  },
  {
    id: PATHS.TRIAL_EXHIBITS,
    label: "Trial Preparation",
    icon: StickyNote,
    category: "Litigation",
    children: [
      { id: PATHS.TRIAL_EXHIBITS, label: "Trial Exhibits", icon: StickyNote },
      { id: PATHS.JURY_SELECTION, label: "Jury Selection", icon: Users },
      { id: PATHS.COURT_REPORTERS, label: "Court Reporters", icon: UserCheck },
    ],
  },
  {
    id: PATHS.MEDIATION,
    label: "ADR & Settlements",
    icon: Handshake,
    category: "Litigation",
    children: [
      { id: PATHS.MEDIATION, label: "Mediation", icon: Handshake },
      { id: PATHS.ARBITRATION, label: "Arbitration", icon: Scale },
      { id: PATHS.SETTLEMENTS, label: "Settlements", icon: Handshake },
    ],
  },
  {
    id: PATHS.APPEALS,
    label: "Appeals",
    icon: GitBranch,
    category: "Litigation",
  },
  {
    id: PATHS.JUDGMENTS,
    label: "Judgments",
    icon: Gavel,
    category: "Litigation",
  },

  // ============================================================================
  // PRIMARY 06: FIRM OPERATIONS & ADMINISTRATION
  // ============================================================================
  {
    id: PATHS.BILLING,
    label: "Billing & Finance",
    icon: DollarSign,
    category: "Operations",
    children: [
      { id: PATHS.BILLING, label: "Billing Dashboard", icon: DollarSign },
      { id: PATHS.TIME_ENTRIES, label: "Time Entries", icon: Clock },
      { id: PATHS.TIMESHEETS, label: "Timesheets", icon: FileSpreadsheet },
      { id: PATHS.INVOICES, label: "Invoices", icon: Receipt },
      { id: PATHS.EXPENSES, label: "Expenses", icon: CreditCard },
      { id: PATHS.RETAINERS, label: "Retainers", icon: Banknote },
      {
        id: PATHS.FEE_AGREEMENTS,
        label: "Fee Agreements",
        icon: FileSignature,
      },
      { id: PATHS.TRUST_ACCOUNTING, label: "Trust Accounting", icon: Book },
      { id: PATHS.TRUST_LEDGER, label: "Trust Ledger", icon: BookOpen },
      { id: PATHS.WRITE_OFFS, label: "Write-Offs", icon: Trash2 },
      {
        id: PATHS.COLLECTIONS_QUEUE,
        label: "Collections",
        icon: AlertTriangle,
      },
    ],
  },
  {
    id: PATHS.CRM,
    label: "Client Relations",
    icon: Users,
    category: "Operations",
    children: [
      { id: PATHS.CRM, label: "CRM Dashboard", icon: Users },
      { id: PATHS.CLIENTS, label: "Clients", icon: Users },
      { id: PATHS.ORGANIZATIONS, label: "Organizations", icon: Building },
      { id: PATHS.CLIENT_PORTAL, label: "Client Portal", icon: Globe },
      { id: PATHS.PARTIES, label: "Parties", icon: Users },
    ],
  },
  {
    id: PATHS.PRACTICE,
    label: "Firm Operations",
    icon: Building2,
    category: "Operations",
    children: [
      { id: PATHS.PRACTICE, label: "Practice Management", icon: Building2 },
      { id: PATHS.PRACTICE_AREAS, label: "Practice Areas", icon: Building2 },
      { id: PATHS.TEAM, label: "Team", icon: Users },
      { id: PATHS.USERS, label: "Users", icon: UserCog },
    ],
  },
  {
    id: PATHS.DAF,
    label: "Compliance & Risk",
    icon: ShieldCheck,
    category: "Operations",
    children: [
      { id: PATHS.DAF, label: "DAF Operations", icon: ShieldCheck },
      { id: PATHS.CONFLICTS, label: "Conflicts", icon: AlertTriangle },
      {
        id: PATHS.CONFLICT_WAIVERS,
        label: "Conflict Waivers",
        icon: FileSignature,
      },
      { id: PATHS.ETHICAL_WALLS, label: "Ethical Walls", icon: Lock },
      {
        id: PATHS.COMPLIANCE_ALERTS,
        label: "Compliance Alerts",
        icon: AlertTriangle,
      },
      { id: PATHS.BAR_REQUIREMENTS, label: "Bar Requirements", icon: Scale },
    ],
  },
  {
    id: PATHS.VENDORS,
    label: "Vendors & Resources",
    icon: Truck,
    category: "Operations",
    children: [
      { id: PATHS.VENDORS, label: "Vendors", icon: Truck },
      { id: PATHS.PROCESS_SERVERS, label: "Process Servers", icon: UserCheck },
      { id: PATHS.EQUIPMENT, label: "Equipment", icon: Wrench },
      { id: PATHS.CONFERENCE_ROOMS, label: "Conference Rooms", icon: DoorOpen },
    ],
  },

  // ============================================================================
  // PRIMARY 07: COMMUNICATION & COLLABORATION (Already in Core)
  // Note: Primary communication tools are in Core section for accessibility
  // ============================================================================

  // ============================================================================
  // PRIMARY 08: ANALYTICS & BUSINESS INTELLIGENCE
  // ============================================================================
  {
    id: PATHS.ANALYTICS,
    label: "Analytics & BI",
    icon: BarChart3,
    category: "Intelligence",
    children: [
      { id: PATHS.ANALYTICS, label: "Analytics Dashboard", icon: BarChart3 },
      { id: PATHS.REPORTS, label: "Reports", icon: FileBarChart },
      {
        id: PATHS.BILLING_REPORTS,
        label: "Financial Reports",
        icon: FileBarChart,
      },
      {
        id: PATHS.BUDGET_FORECASTING,
        label: "Budget Forecasting",
        icon: PieChart,
      },
    ],
  },
  {
    id: PATHS.DATA_PLATFORM,
    label: "Data Platform",
    icon: Database,
    category: "Intelligence",
  },
  {
    id: PATHS.ENTITIES,
    label: "Entity Intelligence",
    icon: Network,
    category: "Intelligence",
  },

  // ============================================================================
  // SYSTEM & AUDIT - System Maintenance & Security
  // ============================================================================
  {
    id: PATHS.AUDIT_LOGS,
    label: "Audit & Security",
    icon: FileBarChart,
    category: "Admin",
    children: [
      { id: PATHS.AUDIT_LOGS, label: "Audit Logs", icon: FileBarChart },
      { id: PATHS.ACCESS_LOGS, label: "Access Logs", icon: History },
      { id: PATHS.BACKUP_RESTORE, label: "Backup & Restore", icon: Archive },
    ],
  },
  {
    id: PATHS.INTEGRATIONS,
    label: "Integrations",
    icon: Plug,
    category: "Admin",
  },
  {
    id: PATHS.ANNOUNCEMENTS,
    label: "Announcements",
    icon: Megaphone,
    category: "Admin",
  },

  // ============================================================================
  // ADMIN - System Administration (Admin-Only)
  // ============================================================================
  {
    id: PATHS.COMPLIANCE,
    label: "Compliance Manager",
    icon: ShieldCheck,
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
  {
    id: PATHS.PERMISSIONS,
    label: "Permissions",
    icon: Lock,
    category: "Admin",
    requiresAdmin: true,
  },
  {
    id: PATHS.SETTINGS,
    label: "Settings",
    icon: Settings,
    category: "Admin",
    requiresAdmin: true,
  },
  {
    id: PATHS.SYSTEM_SETTINGS,
    label: "System Settings",
    icon: Settings,
    category: "Admin",
    requiresAdmin: true,
  },
  // Legacy/deprecated navigation items
  {
    id: PATHS.RATE_TABLES,
    label: "Rate Tables",
    icon: DollarSign,
    category: "Admin",
    requiresAdmin: true,
  },
  {
    id: PATHS.PAYMENT_PLANS,
    label: "Payment Plans",
    icon: Calendar,
    category: "Admin",
    requiresAdmin: true,
  },
  {
    id: PATHS.CONTRACTS,
    label: "Contracts",
    icon: FileSignature,
    category: "Admin",
    requiresAdmin: true,
  },
];
