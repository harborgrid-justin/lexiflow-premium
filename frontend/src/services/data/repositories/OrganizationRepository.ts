/**
 * Organization Repository
 * Enterprise-grade repository for organization management with backend API integration
 */

import { OrganizationsApiService } from "@/api/integrations/organizations-api";
import { ValidationError } from "@/services/core/errors";
import { GenericRepository, createQueryKeys } from "@/services/core/factories";
import { type Organization } from "@/types";

export const ORGANIZATION_QUERY_KEYS = createQueryKeys('organizations');

export class OrganizationRepository extends GenericRepository<Organization> {
  protected apiService = new OrganizationsApiService();
  protected repositoryName = "OrganizationRepository";

  constructor() {
    super("organizations");
    console.log(`[OrganizationRepository] Initialized with Backend API`);
  }

  private orgsApi = new OrganizationsApiService();

  async search(searchTerm: string): Promise<Organization[]> {
    if (!searchTerm) return [];
    return this.executeWithErrorHandling(
      () => this.orgsApi.search(searchTerm) as unknown as Promise<Organization[]>,
      'search'
    );
  }

  async getByType(type: string): Promise<Organization[]> {
    if (!type)
      throw new ValidationError(
        "[OrganizationRepository.getByType] Invalid type"
      );
    return this.executeWithErrorHandling(
      () => this.orgsApi.getByType(type as unknown as never) as unknown as Promise<Organization[]>,
      'getByType'
    );
  }

  async getByJurisdiction(jurisdiction: string): Promise<Organization[]> {
    if (!jurisdiction)
      throw new ValidationError(
        "[OrganizationRepository.getByJurisdiction] Invalid jurisdiction"
      );
    return this.executeWithErrorHandling(
      () => this.orgsApi.getByJurisdiction(jurisdiction) as unknown as Promise<Organization[]>,
      'getByJurisdiction'
    );
  }
}
