/**
 * Case Gateway
 *
 * Handles case-related API operations.
 *
 * @module services/data/api/gateways/caseGateway
 */

import { authGet } from "../../client/authTransport";

export interface Case {
  id: string;
  title: string;
  caseNumber: string;
  description?: string;
  type: string;
  status: string;
  practiceArea?: string;
  jurisdiction?: string;
  court?: string;
  judge?: string;
  filingDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CaseFilter {
  status?: string;
  type?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedCases {
  data: Case[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
    hasNextPage: boolean;
  };
}

export const caseGateway = {
  /**
   * Fetch all cases with optional filtering
   */
  async findAll(filter: CaseFilter = {}): Promise<PaginatedCases> {
    const params = {
      page: filter.page || 1,
      limit: filter.limit || 10,
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.search ? { search: filter.search } : {}),
    };

    return authGet<PaginatedCases>("/cases", {
       params
    });
  },

  /**
   * Get case details by ID
   */
  async findById(id: string): Promise<Case> {
    return authGet<Case>(`/cases/${id}`);
  }
};
