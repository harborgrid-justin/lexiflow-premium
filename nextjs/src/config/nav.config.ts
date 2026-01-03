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
  Milestone,
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

  // ============================================================================
  // CASE WORK - Case Management & Documents
  // ============================================================================
  {
    id: PATHS.CASES,
    label: "Case Management",
    icon: Briefcase,
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
    id: PATHS.DEPOSITIONS,
    label: "Depositions",
    icon: FileEdit,
    category: "Litigation Tools",
  },
  {
    id: PATHS.INTERROGATORIES,
    label: "Interrogatories",
    icon: FileQuestion,
    category: "Litigation Tools",
  },
  {
    id: PATHS.ADMISSIONS,
    label: "Admissions",
    icon: CheckSquare,
    category: "Litigation Tools",
  },
  {
    id: PATHS.PRODUCTION_REQUESTS,
    label: "Production Requests",
    icon: FileArchive,
    category: "Litigation Tools",
  },
  {
    id: PATHS.SUBPOENAS,
    label: "Subpoenas",
    icon: ScrollText,
    category: "Litigation Tools",
  },
  {
    id: PATHS.CUSTODIANS,
    label: "Custodians",
    icon: UserCheck,
    category: "Litigation Tools",
  },
  {
    id: PATHS.LEGAL_HOLDS,
    label: "Legal Holds",
    icon: Lock,
    category: "Litigation Tools",
  },
  {
    id: PATHS.MOTIONS,
    label: "Motions",
    icon: FileSignature,
    category: "Litigation Tools",
  },
  {
    id: PATHS.BRIEFS,
    label: "Briefs",
    icon: FileText,
    category: "Litigation Tools",
  },
  {
    id: PATHS.WITNESSES,
    label: "Witnesses",
    icon: Users,
    category: "Litigation Tools",
  },
  {
    id: PATHS.EXPERT_WITNESSES,
    label: "Expert Witnesses",
    icon: UserPlus,
    category: "Litigation Tools",
  },
  {
    id: PATHS.TRIAL_EXHIBITS,
    label: "Trial Exhibits",
    icon: StickyNote,
    category: "Litigation Tools",
  },
  {
    id: PATHS.JURY_SELECTION,
    label: "Jury Selection",
    icon: Users,
    category: "Litigation Tools",
  },
  {
    id: PATHS.COURT_DATES,
    label: "Court Dates",
    icon: Calendar,
    category: "Litigation Tools",
  },
  {
    id: PATHS.COURT_REPORTERS,
    label: "Court Reporters",
    icon: UserCheck,
    category: "Litigation Tools",
  },
  {
    id: PATHS.MEDIATION,
    label: "Mediation",
    icon: Handshake,
    category: "Litigation Tools",
  },
  {
    id: PATHS.ARBITRATION,
    label: "Arbitration",
    icon: Scale,
    category: "Litigation Tools",
  },
  {
    id: PATHS.SETTLEMENTS,
    label: "Settlements",
    icon: Handshake,
    category: "Litigation Tools",
  },
  {
    id: PATHS.APPEALS,
    label: "Appeals",
    icon: GitBranch,
    category: "Litigation Tools",
  },
  {
    id: PATHS.JUDGMENTS,
    label: "Judgments",
    icon: Gavel,
    category: "Litigation Tools",
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
    label: "Firm Operations",
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
    id: PATHS.INVOICES,
    label: "Invoices",
    icon: Receipt,
    category: "Operations",
  },
  {
    id: PATHS.EXPENSES,
    label: "Expenses",
    icon: CreditCard,
    category: "Operations",
  },
  {
    id: PATHS.TIME_ENTRIES,
    label: "Time Entries",
    icon: Clock,
    category: "Operations",
  },
  {
    id: PATHS.TIMESHEETS,
    label: "Timesheets",
    icon: FileSpreadsheet,
    category: "Operations",
  },
  {
    id: PATHS.RETAINERS,
    label: "Retainers",
    icon: Banknote,
    category: "Operations",
  },
  {
    id: PATHS.FEE_AGREEMENTS,
    label: "Fee Agreements",
    icon: FileSignature,
    category: "Operations",
  },
  {
    id: PATHS.ENGAGEMENT_LETTERS,
    label: "Engagement Letters",
    icon: Mail,
    category: "Operations",
  },
  {
    id: PATHS.BILLING_REPORTS,
    label: "Billing Reports",
    icon: FileBarChart,
    category: "Operations",
  },
  {
    id: PATHS.RATE_TABLES,
    label: "Rate Tables",
    icon: DollarSign,
    category: "Operations",
  },
  {
    id: PATHS.PAYMENT_PLANS,
    label: "Payment Plans",
    icon: Calendar,
    category: "Operations",
  },
  {
    id: PATHS.TRUST_LEDGER,
    label: "Trust Ledger",
    icon: BookOpen,
    category: "Operations",
  },
  {
    id: PATHS.TRUST_ACCOUNTING,
    label: "Trust Accounting",
    icon: Book,
    category: "Operations",
  },
  {
    id: PATHS.WRITE_OFFS,
    label: "Write-Offs",
    icon: Trash2,
    category: "Operations",
  },
  {
    id: PATHS.BUDGET_FORECASTING,
    label: "Budget Forecasting",
    icon: PieChart,
    category: "Operations",
  },
  {
    id: PATHS.COLLECTIONS_QUEUE,
    label: "Collections Queue",
    icon: AlertTriangle,
    category: "Operations",
  },
  { id: PATHS.CRM, label: "Client CRM", icon: Users, category: "Operations" },
  { id: PATHS.CLIENTS, label: "Clients", icon: Users, category: "Operations" },
  {
    id: PATHS.ORGANIZATIONS,
    label: "Organizations",
    icon: Building,
    category: "Operations",
  },
  {
    id: PATHS.INTAKE_FORMS,
    label: "Intake Forms",
    icon: FileEdit,
    category: "Operations",
  },
  {
    id: PATHS.CLIENT_PORTAL,
    label: "Client Portal",
    icon: Globe,
    category: "Operations",
  },
  {
    id: PATHS.CONTRACTS,
    label: "Contracts",
    icon: FileSignature,
    category: "Operations",
  },
  { id: PATHS.PARTIES, label: "Parties", icon: Users, category: "Operations" },
  { id: PATHS.TEAM, label: "Team", icon: Users, category: "Operations" },
  { id: PATHS.USERS, label: "Users", icon: UserCog, category: "Operations" },
  {
    id: PATHS.PRACTICE_AREAS,
    label: "Practice Areas",
    icon: Building2,
    category: "Operations",
  },
  {
    id: PATHS.TASKS,
    label: "Tasks",
    icon: CheckSquare,
    category: "Operations",
  },
  {
    id: PATHS.DEADLINES,
    label: "Deadlines",
    icon: Calendar,
    category: "Operations",
  },
  {
    id: PATHS.NOTIFICATIONS,
    label: "Notifications",
    icon: Bell,
    category: "Operations",
  },
  {
    id: PATHS.REPORTS,
    label: "Reports",
    icon: FileBarChart,
    category: "Operations",
  },
  {
    id: PATHS.INTEGRATIONS,
    label: "Integrations",
    icon: Plug,
    category: "Operations",
  },
  { id: PATHS.VENDORS, label: "Vendors", icon: Truck, category: "Operations" },
  {
    id: PATHS.PROCESS_SERVERS,
    label: "Process Servers",
    icon: UserCheck,
    category: "Operations",
  },
  {
    id: PATHS.EQUIPMENT,
    label: "Equipment",
    icon: Wrench,
    category: "Operations",
  },
  {
    id: PATHS.CONFERENCE_ROOMS,
    label: "Conference Rooms",
    icon: DoorOpen,
    category: "Operations",
  },
  {
    id: PATHS.ANNOUNCEMENTS,
    label: "Announcements",
    icon: Megaphone,
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
  {
    id: PATHS.TEMPLATES,
    label: "Templates",
    icon: FolderOpen,
    category: "Knowledge",
  },
  {
    id: PATHS.DOCUMENT_VERSIONS,
    label: "Document Versions",
    icon: History,
    category: "Knowledge",
  },
  {
    id: PATHS.DOCUMENT_APPROVALS,
    label: "Document Approvals",
    icon: FileCheck,
    category: "Knowledge",
  },

  // ============================================================================
  // COMPLIANCE & RISK - Conflicts & Regulatory
  // ============================================================================
  {
    id: PATHS.CONFLICTS,
    label: "Conflicts",
    icon: AlertTriangle,
    category: "Compliance",
  },
  {
    id: PATHS.CONFLICT_ALERTS,
    label: "Conflict Alerts",
    icon: Bell,
    category: "Compliance",
  },
  {
    id: PATHS.CONFLICT_WAIVERS,
    label: "Conflict Waivers",
    icon: FileSignature,
    category: "Compliance",
  },
  {
    id: PATHS.ETHICAL_WALLS,
    label: "Ethical Walls",
    icon: Lock,
    category: "Compliance",
  },
  {
    id: PATHS.COMPLIANCE_ALERTS,
    label: "Compliance Alerts",
    icon: AlertTriangle,
    category: "Compliance",
  },
  {
    id: PATHS.STATUTE_ALERTS,
    label: "Statute Alerts",
    icon: Bell,
    category: "Compliance",
  },
  {
    id: PATHS.STATUTE_TRACKER,
    label: "Statute Tracker",
    icon: Calendar,
    category: "Compliance",
  },
  {
    id: PATHS.BAR_REQUIREMENTS,
    label: "Bar Requirements",
    icon: Scale,
    category: "Compliance",
  },
  {
    id: PATHS.AUDIT_LOGS,
    label: "Audit Logs",
    icon: FileBarChart,
    category: "Compliance",
  },
  {
    id: PATHS.ACCESS_LOGS,
    label: "Access Logs",
    icon: History,
    category: "Compliance",
  },
  {
    id: PATHS.BACKUP_RESTORE,
    label: "Backup & Restore",
    icon: Archive,
    category: "Compliance",
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
];
