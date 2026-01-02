import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * Organizations API Routes
 * Handles organization/entity management with type and status filtering
 */

export enum OrganizationType {
  LAW_FIRM = "law_firm",
  CORPORATION = "corporation",
  GOVERNMENT = "government",
  NONPROFIT = "nonprofit",
  PARTNERSHIP = "partnership",
  INDIVIDUAL = "individual",
}

export enum OrganizationStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
}

export interface CreateOrganizationDto {
  name: string;
  type: OrganizationType;
  status?: OrganizationStatus;
  jurisdiction?: string;
  taxId?: string;
  address?: string;
  email?: string;
  phone?: string;
}

/**
 * GET /api/organizations - Get all organizations
 * @query search?: string
 * @query page?: number
 * @query limit?: number
 */
export async function GET(request: NextRequest) {
  return proxyToBackend(request, `/api/organizations`);
}

/**
 * POST /api/organizations - Create organization
 * @body CreateOrganizationDto
 */
export async function POST(request: NextRequest) {
  return proxyToBackend(request, `/api/organizations`);
}
