import { ProjectsApiService } from "@/api/workflow/projects-api";
import { GenericRepository } from "@/services/core/factories";
import { type Project } from "@/types";

export class ProjectRepository extends GenericRepository<Project> {
  protected apiService = new ProjectsApiService();
  protected repositoryName = "ProjectRepository";

  constructor() {
    super("projects");
    console.log("[ProjectRepository] Initialized with Backend API");
  }
}
