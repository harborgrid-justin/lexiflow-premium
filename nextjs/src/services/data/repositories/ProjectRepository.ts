import { Project } from "@/types";
import { Repository } from "@/services/core/Repository";
import { STORES } from "@/services/data/db";
import { isBackendApiEnabled } from "@/api";
import { ProjectsApiService } from "@/api/workflow/projects-api";

export class ProjectRepository extends Repository<Project> {
  private projectsApi: ProjectsApiService;

  constructor() {
    super(STORES.PROJECTS);
    this.projectsApi = new ProjectsApiService();
  }

  override async getAll(): Promise<Project[]> {
    if (isBackendApiEnabled()) {
      return this.projectsApi.getAll();
    }
    return super.getAll();
  }

  override async getById(id: string): Promise<Project | undefined> {
    if (isBackendApiEnabled()) {
      try {
        return await this.projectsApi.getById(id);
      } catch (error) {
        console.warn("[ProjectRepository] Failed to fetch from backend", error);
        return undefined;
      }
    }
    return super.getById(id);
  }

  override async add(
    item: Omit<Project, "id" | "createdAt" | "updatedAt">
  ): Promise<Project> {
    if (isBackendApiEnabled()) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return this.projectsApi.create(item as any);
    }
    return super.add(item as Project);
  }

  override async update(id: string, item: Partial<Project>): Promise<Project> {
    if (isBackendApiEnabled()) {
      return this.projectsApi.update(id, item);
    }
    return super.update(id, item);
  }

  override async delete(id: string): Promise<void> {
    if (isBackendApiEnabled()) {
      await this.projectsApi.delete(id);
      return;
    }
    return super.delete(id);
  }
}
