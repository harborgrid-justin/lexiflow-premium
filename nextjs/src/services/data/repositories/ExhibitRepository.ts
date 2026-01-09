import { TrialExhibit } from "@/types";
import { Repository } from "@/services/core/Repository";
import { STORES } from "@/services/data/db";
import { isBackendApiEnabled } from "@/api";
import { ExhibitsApiService } from "@/api/trial/exhibits-api";

export class ExhibitRepository extends Repository<TrialExhibit> {
  private exhibitsApi: ExhibitsApiService;

  constructor() {
    super(STORES.EXHIBITS);
    this.exhibitsApi = new ExhibitsApiService();
  }

  override async getAll(): Promise<TrialExhibit[]> {
    if (isBackendApiEnabled()) {
      return this.exhibitsApi.getAll();
    }
    return super.getAll();
  }

  override async getById(id: string): Promise<TrialExhibit | undefined> {
    if (isBackendApiEnabled()) {
      try {
        return await this.exhibitsApi.getById(id);
      } catch (error) {
        console.warn("[ExhibitRepository] Failed to fetch from backend", error);
        return undefined;
      }
    }
    return super.getById(id);
  }

  override async add(
    item: Omit<TrialExhibit, "id" | "createdAt" | "updatedAt">
  ): Promise<TrialExhibit> {
    if (isBackendApiEnabled()) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return this.exhibitsApi.create(item as any);
    }
    return super.add(item as TrialExhibit);
  }

  override async update(
    id: string,
    item: Partial<TrialExhibit>
  ): Promise<TrialExhibit> {
    if (isBackendApiEnabled()) {
      return this.exhibitsApi.update(id, item);
    }
    return super.update(id, item);
  }

  override async delete(id: string): Promise<void> {
    if (isBackendApiEnabled()) {
      await this.exhibitsApi.delete(id);
      return;
    }
    return super.delete(id);
  }
}
