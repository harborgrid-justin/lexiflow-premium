/**
 * @module components/enterprise/CRM/ClientAnalytics/constants
 * @description Static data and configuration for Client Analytics module
 */

import { AlertTriangle, DollarSign, ThumbsUp, TrendingUp } from "lucide-react";

export const TABS = [
  { id: "profitability" as const, label: "Profitability", icon: DollarSign },
  { id: "ltv" as const, label: "Lifetime Value", icon: TrendingUp },
  { id: "risk" as const, label: "Risk Assessment", icon: AlertTriangle },
  { id: "satisfaction" as const, label: "Satisfaction", icon: ThumbsUp },
] as const;
