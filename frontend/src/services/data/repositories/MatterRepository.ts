// services/repositories/MatterRepository.ts
import { casesApi, CasesApiService } from "@/api/litigation/cases-api";
import { GenericRepository } from "@/services/core/factories";
import { type Matter, type MatterId, MatterStatus } from "@/types";

export class MatterRepository extends GenericRepository<Matter> {
  protected apiService: CasesApiService = casesApi;
  protected repositoryName = "MatterRepository";

  /**
   * Get matters by status
   */
  async getByStatus(status: string): Promise<Matter[]> {
    try {
      const allMatters = (await casesApi.getAll({
        status,
      })) as unknown as Matter[];
      return allMatters;
    } catch (error) {
      console.error("[MatterRepository.getByStatus] Error:", error);
      throw error;
    }
  }

  /**
   * Get matters by client ID
   */
  async getByClientId(clientId: string): Promise<Matter[]> {
    const allMatters = await this.getAll();
    return allMatters.filter((matter) => matter.clientId === clientId);
  }

  /**
   * Get matters by lead attorney ID
   */
  async getByLeadAttorney(leadAttorneyId: string): Promise<Matter[]> {
    const allMatters = await this.getAll();
    return allMatters.filter(
      (matter) =>
        matter.leadAttorneyId === leadAttorneyId ||
        matter.responsibleAttorneyId === leadAttorneyId,
    );
  }

  /**
   * Get matters by matter type
   */
  async getByMatterType(matterType: string): Promise<Matter[]> {
    try {
      return (await casesApi.getAll({
        type: matterType,
      })) as unknown as Matter[];
    } catch (error) {
      console.error("[MatterRepository.getByMatterType] Error:", error);
      throw error;
    }
  }

  /**
   * Search matters by title, matter number, or client name
   */
  async searchMatters(query: string): Promise<Matter[]> {
    try {
      return (await casesApi.search(query)) as unknown as Matter[];
    } catch (error) {
      console.error("[MatterRepository.search] Error:", error);
      throw error;
    }
  }

  /**
   * Get active matters (not closed)
   */
  async getActive(): Promise<Matter[]> {
    const allMatters = await this.getAll();
    return allMatters.filter(
      (matter) =>
        matter.status !== MatterStatus.CLOSED &&
        matter.status !== MatterStatus.ARCHIVED,
    );
  }

  /**
   * Get matters in intake (backend maps INTAKE to ACTIVE status)
   */
  async getIntake(): Promise<Matter[]> {
    return this.getByStatus(MatterStatus.INTAKE);
  }

  /**
   * Get matter statistics
   */
  async getStatistics(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byMatterType: Record<string, number>;
    byPriority: Record<string, number>;
  }> {
    const allMatters = await this.getAll();

    const byStatus: Record<string, number> = {};
    const byMatterType: Record<string, number> = {};
    const byPriority: Record<string, number> = {};

    allMatters.forEach((matter) => {
      // Count by status
      byStatus[matter.status] = (byStatus[matter.status] || 0) + 1;

      // Count by matter type
      byMatterType[matter.matterType] =
        (byMatterType[matter.matterType] || 0) + 1;

      // Count by priority
      byPriority[matter.priority] = (byPriority[matter.priority] || 0) + 1;
    });

    return {
      total: allMatters.length,
      byStatus,
      byMatterType,
      byPriority,
    };
  }

  /**
   * Archive a matter (set status to ARCHIVED)
   */
  async archive(id: MatterId): Promise<Matter> {
    return this.update(id, { status: MatterStatus.ARCHIVED });
  }

  /**
   * Restore an archived matter (set status back to ACTIVE)
   */
  async restore(id: MatterId): Promise<Matter> {
    return this.update(id, { status: MatterStatus.ACTIVE });
  }
}
