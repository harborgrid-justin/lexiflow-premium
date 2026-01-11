import { ProjectsApiService } from "@/api/workflow/projects-api";
import { Repository } from "@/services/core/Repository";
import { Project } from "@/types";

export class ProjectRepository extends Repository<Project> {
  private projectsApi: ProjectsApiService;

  constructor() {
    super("projects");
    this.projectsApi = new ProjectsApiService();
    console.log("[ProjectRepository] Initialized with Backend API");
  }

  // Override base methods to use API
  override async getAll(options?: Record<string, unknown>): Promise<Project[]> {
    try {
      // API expects filters, options might be generic. mapping might be needed.
      return (await this.projectsApi.getAll(options)) as unknown as Project[];
    } catch (error) {
      console.error("[ProjectRepository] Error fetching projects:", error);
      throw error;
    }
  }

  override async getById(id: string): Promise<Project | undefined> {
    try {
      const project = (await this.projectsApi.getById(
        id
      )) as unknown as Project;
      return project || undefined;
    } catch (error) {
      // getById usually throws if not found in backend or returns null?
      // Repository pattern expects null if not found or throws EntityNotFoundError.
      // We'll let it throw or handle.
      console.error(`[ProjectRepository] Error fetching project ${id}:`, error);
      throw error;
    }
  }

  override async add(item: Partial<Project>): Promise<Project> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (await this.projectsApi.create(item as any)) as unknown as Project;
    } catch (error) {
      console.error("[ProjectRepository] Error creating project:", error);
      throw error;
    }
  }

  override async update(id: string, item: Partial<Project>): Promise<Project> {
    try {
      return (await this.projectsApi.update(
        id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        item as any
      )) as unknown as Project;
    } catch (error) {
      console.error(`[ProjectRepository] Error updating project ${id}:`, error);
      throw error;
    }
  }

  override async delete(id: string): Promise<void> {
    try {
      await this.projectsApi.delete(id);
    } catch (error) {
      console.error(`[ProjectRepository] Error deleting project ${id}:`, error);
      throw error;
    }
  }
}
