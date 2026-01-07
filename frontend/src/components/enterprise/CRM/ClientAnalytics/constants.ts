/**
 * @module components/enterprise/CRM/ClientAnalytics/constants
 * @description Static data and configuration for Client Analytics module
 */

import { AlertTriangle, DollarSign, ThumbsUp, TrendingUp } from "lucide-react";
import type {
  ClientLifetimeValue,
  ClientProfitability,
  ClientRiskAssessment,
  ClientSatisfaction,
  ClientSegment,
} from "./types";

export const TABS = [
  { id: "profitability" as const, label: "Profitability", icon: DollarSign },
  { id: "ltv" as const, label: "Lifetime Value", icon: TrendingUp },
  { id: "risk" as const, label: "Risk Assessment", icon: AlertTriangle },
  { id: "satisfaction" as const, label: "Satisfaction", icon: ThumbsUp },
] as const;

export const MOCK_PROFITABILITY_DATA: ClientProfitability[] = [
  {
    clientId: "1",
    clientName: "Acme Corporation",
    totalRevenue: 450000,
    totalCosts: 270000,
    profit: 180000,
    profitMargin: 40,
    realization: 92,
    collectionRate: 95,
    trend: "up",
  },
  {
    clientId: "2",
    clientName: "Tech Startup Inc.",
    totalRevenue: 320000,
    totalCosts: 224000,
    profit: 96000,
    profitMargin: 30,
    realization: 85,
    collectionRate: 88,
    trend: "stable",
  },
  {
    clientId: "3",
    clientName: "Global Industries LLC",
    totalRevenue: 280000,
    totalCosts: 238000,
    profit: 42000,
    profitMargin: 15,
    realization: 78,
    collectionRate: 72,
    trend: "down",
  },
];

export const MOCK_LTV_DATA: ClientLifetimeValue[] = [
  {
    clientId: "1",
    clientName: "Acme Corporation",
    ltv: 1250000,
    acquisitionCost: 15000,
    retentionRate: 95,
    avgAnnualRevenue: 180000,
    yearsAsClient: 5.2,
    projectedFutureValue: 850000,
  },
  {
    clientId: "2",
    clientName: "Tech Startup Inc.",
    ltv: 780000,
    acquisitionCost: 12000,
    retentionRate: 88,
    avgAnnualRevenue: 140000,
    yearsAsClient: 3.8,
    projectedFutureValue: 520000,
  },
];

export const MOCK_RISK_DATA: ClientRiskAssessment[] = [
  {
    clientId: "1",
    clientName: "Acme Corporation",
    overallRisk: "Low",
    riskScore: 15,
    factors: {
      paymentRisk: 10,
      scopeCreepRisk: 20,
      communicationRisk: 15,
      expectationRisk: 18,
      complianceRisk: 12,
    },
    outstandingBalance: 15000,
    daysOutstanding: 12,
    disputedInvoices: 0,
    lastActivity: "2026-01-02",
  },
  {
    clientId: "3",
    clientName: "Global Industries LLC",
    overallRisk: "High",
    riskScore: 78,
    factors: {
      paymentRisk: 85,
      scopeCreepRisk: 72,
      communicationRisk: 68,
      expectationRisk: 80,
      complianceRisk: 65,
    },
    outstandingBalance: 125000,
    daysOutstanding: 87,
    disputedInvoices: 3,
    lastActivity: "2025-12-15",
  },
];

export const MOCK_SATISFACTION_DATA: ClientSatisfaction[] = [
  {
    clientId: "1",
    clientName: "Acme Corporation",
    nps: 85,
    csat: 92,
    responsiveness: 9.2,
    quality: 9.5,
    value: 8.8,
    likelihood: 9.4,
    lastSurveyDate: "2025-12-20",
    totalSurveys: 8,
  },
  {
    clientId: "2",
    clientName: "Tech Startup Inc.",
    nps: 72,
    csat: 84,
    responsiveness: 8.5,
    quality: 8.8,
    value: 8.2,
    likelihood: 8.6,
    lastSurveyDate: "2025-12-15",
    totalSurveys: 5,
  },
];

export const MOCK_SEGMENT_DATA: ClientSegment[] = [
  {
    segment: "Enterprise",
    count: 15,
    revenue: 2500000,
    avgLifetimeValue: 1200000,
    color: "#3b82f6",
  },
  {
    segment: "Mid-Market",
    count: 35,
    revenue: 1800000,
    avgLifetimeValue: 450000,
    color: "#10b981",
  },
  {
    segment: "Small Business",
    count: 50,
    revenue: 850000,
    avgLifetimeValue: 85000,
    color: "#f59e0b",
  },
  {
    segment: "Individual",
    count: 80,
    revenue: 320000,
    avgLifetimeValue: 15000,
    color: "#8b5cf6",
  },
];

export const MOCK_REVENUE_TREND = [
  { month: "Jul", revenue: 420000, profit: 168000 },
  { month: "Aug", revenue: 450000, profit: 180000 },
  { month: "Sep", revenue: 480000, profit: 192000 },
  { month: "Oct", revenue: 510000, profit: 204000 },
  { month: "Nov", revenue: 490000, profit: 196000 },
  { month: "Dec", revenue: 550000, profit: 220000 },
];
