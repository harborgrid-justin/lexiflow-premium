/**
 * CRM Frontend API
 * Enterprise-grade API layer for CRM leads, opportunities, and relationships
 */

import { client } from "./client";
import { ValidationError } from "./errors";
import { failure, type Result } from "./types";

import type { ClientRelationship, Lead, Opportunity } from "@/types/crm";

export async function getLeads(): Promise<Result<Lead[]>> {
  return client.get<Lead[]>("/crm/leads");
}

export async function getOpportunities(): Promise<Result<Opportunity[]>> {
  return client.get<Opportunity[]>("/crm/opportunities");
}

export async function getRelationships(): Promise<
  Result<ClientRelationship[]>
> {
  return client.get<ClientRelationship[]>("/crm/relationships");
}

export async function createLead(input: Partial<Lead>): Promise<Result<Lead>> {
  if (!input || typeof input !== "object") {
    return failure(new ValidationError("Lead input is required"));
  }

  return client.post<Lead>("/crm/leads", input);
}

export const crmApi = {
  getLeads,
  getOpportunities,
  getRelationships,
  createLead,
};
