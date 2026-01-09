/**
 * @module components/enterprise/CRM/BusinessDevelopment/constants
 * @description Static data and configuration for Business Development module
 */

import { BarChart3, FileText, Target, Users } from "lucide-react";

export const TABS = [
  { id: "leads" as const, label: "Leads", icon: Users },
  { id: "pitches" as const, label: "Pitches", icon: Target },
  { id: "rfps" as const, label: "RFPs", icon: FileText },
  { id: "analysis" as const, label: "Win/Loss Analysis", icon: BarChart3 },
] as const;
