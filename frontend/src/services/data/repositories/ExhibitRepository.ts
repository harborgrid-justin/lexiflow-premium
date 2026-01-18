import { ExhibitsApiService } from "@/api/trial/exhibits-api";
import { GenericRepository } from "@/services/core/factories";
import { type TrialExhibit } from "@/types";

export class ExhibitRepository extends GenericRepository<TrialExhibit> {
  protected apiService = new ExhibitsApiService();
  protected repositoryName = "ExhibitRepository";

  constructor() {
    super("exhibits");
    console.log(`[ExhibitRepository] Initialized with Backend API`);
  }
}
