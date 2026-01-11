/**
 * @module types/crm
 * @description CRM-related types for leads, contacts, and client relationship management
 */

import type { BaseEntity, EntityId } from "./primitives";

// ============================================================================
// LEAD MANAGEMENT
// ============================================================================

export enum LeadStatus {
  NEW = "new",
  CONTACTED = "contacted",
  QUALIFIED = "qualified",
  PROPOSAL = "proposal",
  NEGOTIATION = "negotiation",
  WON = "won",
  LOST = "lost",
}

export enum LeadSource {
  REFERRAL = "referral",
  WEBSITE = "website",
  SOCIAL_MEDIA = "social_media",
  EMAIL_CAMPAIGN = "email_campaign",
  EVENT = "event",
  COLD_CALL = "cold_call",
  OTHER = "other",
}

export enum LeadPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

/**
 * CRM Lead entity
 * Represents potential clients in the sales pipeline
 */
export interface CRMLead extends BaseEntity {
  id: EntityId;

  // Contact Information
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  title?: string;

  // Lead Details
  status: LeadStatus;
  source: LeadSource;
  priority: LeadPriority;
  estimatedValue: number;

  // Pipeline Management
  stage: string;
  score?: number; // Lead scoring 0-100
  probability?: number; // Win probability 0-100

  // Assignment
  assignedTo?: string;
  assignedToName?: string;

  // Tracking
  firstContactDate?: string;
  lastContactDate?: string;
  nextFollowUpDate?: string;

  // Additional Information
  notes?: string;
  tags?: string[];
  industry?: string;
  location?: string;

  // Conversion
  convertedToClientId?: string;
  convertedDate?: string;

  // Legacy/UI fields
  value?: string; // Formatted currency string for display
}

// Add these exports at the end of types/crm.ts or appropriate place
export interface ConversionTrend {
  month: string;
  rate: number;
}

export interface LeadsBySource {
  source: string;
  value: number;
}

export interface LeadsByStatus {
  status: string;
  value: number;
}

export interface CRMAnalytics {
  growth: Array<{
    month: string;
    newLeads: number;
    converted: number;
    lost: number;
  }>;
  industry: Array<{
    name: string;
    value: number;
    count: number;
  }>;
  revenue: Array<{
    month: string;
    amount: number;
    forecast: number;
  }>;
  sources: Array<{
    source: string;
    count: number;
    conversionRate: number;
  }>;
}

// ============================================================================
// EXPORTS
// ============================================================================

export interface Opportunity extends BaseEntity {
  id: EntityId;
  clientId: string;
  title: string;
  value: number;
  stage:
    | "Lead"
    | "Qualified"
    | "Proposal"
    | "Negotiation"
    | "Closed Won"
    | "Closed Lost";
  probability: number;
  expectedCloseDate: string;
  assignedTo: string;
  practiceArea: string;
}

export interface ClientRelationship extends BaseEntity {
  id: EntityId;
  clientId: string;
  relatedClientId: string;
  relatedClientName: string;
  relationshipType:
    | "Parent"
    | "Subsidiary"
    | "Partner"
    | "Competitor"
    | "Vendor";
  strength: number;
  notes?: string;
}

export type { CRMLead as Lead };
