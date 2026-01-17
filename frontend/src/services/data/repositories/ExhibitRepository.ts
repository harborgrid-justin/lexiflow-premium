import { ExhibitsApiService } from "@/api/trial/exhibits-api";
import { Repository } from "@/services/core/Repository";
import { type TrialExhibit } from "@/types";

export class ExhibitRepository extends Repository<TrialExhibit> {
  private exhibitsApi: ExhibitsApiService;

  constructor() {
    super("exhibits");
    this.exhibitsApi = new ExhibitsApiService();
    console.log(`[ExhibitRepository] Initialized with Backend API`);
  }

  override async getAll(): Promise<TrialExhibit[]> {
    try {
      return await this.exhibitsApi.getAll();
    } catch (error) {
      console.error("[ExhibitRepository.getAll] Error:", error);
      throw error;
    }
  }

  override async getById(id: string): Promise<TrialExhibit | undefined> {
    try {
      return await this.exhibitsApi.getById(id);
    } catch (error) {
      console.error("[ExhibitRepository.getById] Error:", error);
      return undefined;
    }
  }

  override async add(item: TrialExhibit): Promise<TrialExhibit> {
    try {
      // Mapping add to create/add
      return await this.exhibitsApi.create(item);
    } catch (error) {
      console.error("[ExhibitRepository.add] Error:", error);
      throw error;
    }
  }

  override async update(
    id: string,
    updates: Partial<TrialExhibit>
  ): Promise<TrialExhibit> {
    try {
      return await this.exhibitsApi.update(id, updates);
    } catch (error) {
      console.error("[ExhibitRepository.update] Error:", error);
      throw error;
    }
  }

  override async delete(id: string): Promise<void> {
    try {
      await this.exhibitsApi.delete(id);
    } catch (error) {
      console.error("[ExhibitRepository.delete] Error:", error);
      throw error;
    }
  }
}
